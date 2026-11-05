"""Synthetic OCR exercise, never an accuracy benchmark or a real player card."""
import numpy as np
from PIL import Image,ImageDraw,ImageFont
from pathlib import Path

base=Path('docs/ui-lab/scanner-poc/vendor/assets')
median=np.load(base/'chrome_ref_median.npy')
mask=np.load(base/'chrome_ref_mask.npy')
gray=np.repeat(np.repeat(median.clip(0,255).astype('uint8'),4,0),4,1)
image=Image.fromarray(gray).convert('RGB')
draw=ImageDraw.Draw(image)
font=ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf',23)
for x in [24,395,771,1146,1519]:
    for i,(name,value) in enumerate([('CRIT Rate','6.3%'),('CRIT DMG','12.6%'),('ATK','6.4%'),('HP','6.4%'),('DEF','8.1%')]):
        y=650+228+i*34
        draw.rectangle((x+35,y,x+360,y+30),fill='black')
        draw.text((x+36,y),name,font=font,fill='white')
        draw.text((x+290,y),value,font=font,fill='white')
fullmask=np.repeat(np.repeat(mask,4,0),4,1).astype(bool)
pixels=np.array(image)
pixels[fullmask]=np.repeat(gray[:,:,None],3,2)[fullmask]
Image.fromarray(pixels).save('artifacts/browser-scanner/synthetic-card.png')
crop=Image.new('RGB',(220,90),'black');draw=ImageDraw.Draw(crop)
draw.text((12,8),'CRIT Rate',font=font,fill='white');draw.text((12,45),'6.3%',font=font,fill='white')
crop.save('artifacts/browser-scanner/ocr-crop.png')
