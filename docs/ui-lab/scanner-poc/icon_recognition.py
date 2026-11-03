"""Geometry-checked fallback for partial Echo artwork. GPL-3.0.

Keeps WuWaBuilds' SIFT + cost + canonical badge matching. For a weak ratio,
use standard OpenCV SIFT/RANSAC homography verification rather than lowering
the acceptance floor. See UPSTREAM.md for research and measured limits.
"""
import cv2
import numpy as np
import card
import data

def geometric_matches(panel):
    icon=panel[:182,:188]
    kp,des=cv2.SIFT_create().detectAndCompute(icon,None)
    if des is None or len(kp)<8: return []
    cost=card.get_echo_cost(panel)
    matcher=cv2.BFMatcher(); ranked=[]
    for eid,(target_kp,target_des) in data.TEMPLATE_FEATURES.items():
        if cost in (1,3,4) and data.ECHO_COSTS.get(eid)!=cost: continue
        pairs=matcher.knnMatch(des,target_des,k=2)
        good=[p[0] for p in pairs if len(p)==2 and p[0].distance<.7*p[1].distance]
        if len(good)<8: continue
        source=np.float32([kp[m.queryIdx].pt for m in good])
        target=np.float32([target_kp[m.trainIdx].pt for m in good])
        cv2.setRNGSeed(0)
        homography,mask=cv2.findHomography(source,target,cv2.RANSAC,4)
        if homography is None or mask is None or not np.isfinite(homography).all(): continue
        keep=mask.ravel().astype(bool); count=int(keep.sum())
        if count<3: continue
        unique=min(len(np.unique(np.round(source[keep],1),axis=0)),len(np.unique(np.round(target[keep],1),axis=0)))
        coverage=cv2.contourArea(cv2.convexHull(source[keep]))/(icon.shape[0]*icon.shape[1])
        ranked.append({'echoId':eid,'inliers':count,'uniquePoints':unique,
                       'inlierRatio':count/len(good),'coverage':coverage})
    return sorted(ranked,key=lambda x:(-x['inliers'],-x['inlierRatio'],x['echoId']))

def recognize(panel):
    try: eid,score,sid=card.match_icon(panel)
    except (cv2.error,ValueError,IndexError): eid,score,sid=None,0,None
    evidence={'method':'SIFT + canonical Sonata badge','matchScore':round(float(score),4)}
    if score>=.08: return eid,score,sid,evidence
    ranked=geometric_matches(panel)
    if ranked:
        best=ranked[0]; margin=best['inliers']-(ranked[1]['inliers'] if len(ranked)>1 else 0)
        if (best['inliers']>=8 and best['uniquePoints']>=6 and best['inlierRatio']>=.65
                and best['coverage']>=.08 and margin>=2):
            eid=best['echoId'];sid=data.determine_element(card.get_element_region(panel),eid)
            if sid in data.ECHO_SET_IDS.get(eid,[]):
                evidence.update(method='SIFT + RANSAC geometry + canonical Sonata badge',geometry={
                    'inliers':best['inliers'],'uniquePoints':best['uniquePoints'],
                    'inlierRatio':round(best['inlierRatio'],4),'coverage':round(best['coverage'],4),'inlierMargin':margin})
                return eid,score,sid,evidence
    evidence['suggestion']={'echoId':eid,'sonataId':sid} if eid else None
    return None,score,None,evidence
