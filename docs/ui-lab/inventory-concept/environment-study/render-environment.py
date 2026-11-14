# Original Bellibing environment study. All meshes/materials procedural; no external artwork.
import bpy, math, os, sys, json
from mathutils import Vector
from math import sin,cos,pi
args=sys.argv[sys.argv.index('--')+1:] if '--' in sys.argv else []
out=args[0] if args else os.path.dirname(os.path.abspath(__file__))
only=args[1] if len(args)>1 else None
os.makedirs(out,exist_ok=True)
bpy.ops.object.select_all(action='SELECT');bpy.ops.object.delete(use_global=False)
scene=bpy.context.scene;scene.render.engine='BLENDER_EEVEE_NEXT';scene.cycles.device='CPU';scene.cycles.samples=20;scene.cycles.use_denoising=False
scene.render.resolution_x=1440;scene.render.resolution_y=810;scene.render.resolution_percentage=100
scene.render.image_settings.file_format='PNG';scene.render.image_settings.color_mode='RGBA';scene.render.film_transparent=False
scene.view_settings.view_transform='AgX';scene.view_settings.look='AgX - Medium High Contrast';scene.view_settings.exposure=-.6
scene.world.color=(.008,.010,.016)

def mat(name,color,rough=.6,metal=0,stone=False):
 m=bpy.data.materials.new(name);m.use_nodes=True;n=m.node_tree.nodes;p=n.get('Principled BSDF');p.inputs['Base Color'].default_value=(*color,1);p.inputs['Roughness'].default_value=rough;p.inputs['Metallic'].default_value=metal
 if stone:
  noise=n.new('ShaderNodeTexNoise');noise.inputs['Scale'].default_value=3.7;noise.inputs['Detail'].default_value=5;noise.inputs['Roughness'].default_value=.72
  ramp=n.new('ShaderNodeValToRGB');ramp.color_ramp.elements[0].position=.16;ramp.color_ramp.elements[0].color=(*[c*.55 for c in color],1);ramp.color_ramp.elements[1].position=.82;ramp.color_ramp.elements[1].color=(*[c*1.3 for c in color],1)
  m.node_tree.links.new(noise.outputs['Fac'],ramp.inputs[0]);m.node_tree.links.new(ramp.outputs[0],p.inputs['Base Color'])
  bump=n.new('ShaderNodeBump');bump.inputs['Strength'].default_value=.23;bump.inputs['Distance'].default_value=.035;m.node_tree.links.new(noise.outputs['Fac'],bump.inputs['Height']);m.node_tree.links.new(bump.outputs[0],p.inputs['Normal'])
 return m
stone=mat('Blue-black limestone',(.13,.16,.185),.63,0,True);dark=mat('Honed basalt',(.035,.047,.059),.3,.15,True);bronze=mat('Aged muted bronze',(.23,.18,.10),.38,.65);floor=mat('Worn pale slate',(.17,.185,.19),.36,.1,True);cloth=mat('Ivory stone drapery',(.42,.39,.32),.65,.05,True);porcelain=mat('Faceless study mannequin',(.34,.32,.27),.34,.25)
figure=[];foreground=[];platform=[]
def finish(o,name,material,group=None,bevel=.04):
 o.name=name;o.data.materials.append(material)
 if bevel and o.type=='MESH':
  mod=o.modifiers.new('Stone edge catches light','BEVEL');mod.width=bevel;mod.segments=3;o.modifiers.new('Weighted corner normals','WEIGHTED_NORMAL')
 if group is not None:group.append(o)
 return o

def box(name,loc,scale,material=stone,group=None,bevel=.04):
 bpy.ops.mesh.primitive_cube_add(size=1,location=loc);o=bpy.context.object;o.scale=scale;bpy.ops.object.transform_apply(location=False,rotation=False,scale=True);return finish(o,name,material,group,bevel)
def sphere(name,loc,scale,material=porcelain,group=None):
 bpy.ops.mesh.primitive_uv_sphere_add(segments=40,ring_count=24,location=loc);o=bpy.context.object;o.scale=scale;bpy.ops.object.transform_apply(location=False,rotation=False,scale=True)
 for p in o.data.polygons:p.use_smooth=True
 return finish(o,name,material,group,0)
def cyl(name,loc,radius,depth,material=stone,group=None):
 bpy.ops.mesh.primitive_cylinder_add(vertices=96,radius=radius,depth=depth,location=loc);return finish(bpy.context.object,name,material,group,.025)
def rod(name,a,b,r,material=porcelain,group=None):
 a,b=Vector(a),Vector(b);o=cyl(name,(a+b)/2,r,(b-a).length,material,group);o.rotation_euler=(b-a).to_track_quat('Z','Y').to_euler();return o

def area(name,loc,target,color,energy,size):
 data=bpy.data.lights.new(name,'AREA');data.energy=energy;data.color=color;data.shape='DISK';data.size=size;o=bpy.data.objects.new(name,data);bpy.context.collection.objects.link(o);o.location=loc;o.rotation_euler=(Vector(target)-o.location).to_track_quat('-Z','Y').to_euler();return o
# Continuous floor and a low oval stone dais; joints are actual shallow gaps, not perspective lines.
box('Foundation',(0,8,-.25),(24,38,.35),dark)
for y in range(-5,29,2):
 for x in range(-12,12,2):
  box('Large limestone floor slab',(x+.99,y+.99,-.045),(1.974,1.974,.10),floor,bevel=.012)
cyl('Lower display step',(0,0,.07),2.0,.18,dark,platform);cyl('Upper display stone',(0,0,.18),1.83,.10,stone,platform)
# A side nave recedes toward a distant, luminous exit. Different object scale, occlusion and material roughness establish depth.
box('Back wall',(0,27,5),(24,.6,10),stone)
for side in [-1,1]:
 for i,y in enumerate([1.5,7,13,19,25]):
  x=side*5.2
  box('Square pier plinth',(x,y,.22),(1.3,1.3,.45),dark)
  box('Tall weathered pier',(x,y,4.7),(.65,.78,9.2),stone)
  box('Capital',(x,y,8.7),(1.2,1.2,.36),dark)
  box('Inset bronze reveal',(x-side*.34,y-.2,4.3),(.035,.05,7.2),bronze,bevel=.005)
  box('Overhead stone cross beam',(0,y,9.05),(11.2,.65,.5),stone)
# Far threshold with diminishing inset frames, not a giant graphic circle behind the subject.
for y,w in [(23,3.7),(25.5,3.1),(27.2,2.5)]:
 for sign in [-1,1]:box('Distant threshold jamb',(sign*w,y,3.5),(.45,.5,7.0),dark)
 box('Distant lintel',(0,y,6.9),(w*2+.5,.5,.5),dark)
# Side window blades / soft indirect light and a shallow reflective basin.
for y in [3.5,9,14.5,20]:
 box('Left window sill',(-7,y,.8),(2,.32,.32),dark)
 for z in [2.8,5.0,7.2]:box('Window louver',(-7,y,z),(2.2,.12,.14),bronze)
box('Still basin border',(6.7,4,.12),(2.0,15,.28),dark)
water=mat('Still dark reflecting water',(.025,.05,.065),.12,.6);box('Quiet reflected pool',(6.7,4,.27),(1.75,14.6,.025),water,bevel=0)
# Near balustrade acts as a real foreground silhouette, intentionally outside the functional center.
for side in [-1,1]:
 box('Near stone parapet',(side*3.7,-3.5,.75),(1.8,1.0,1.5),dark,foreground,.06)
 box('Near bronze lip',(side*3.7,-3.5,1.54),(1.9,1.1,.08),bronze,foreground,.02)
# Original abstract, clothed, faceless standing figure; never Character art or reconstructed anatomy.
# Full visible feet make surface contact and shadow independently judgeable.
for side in [-1,1]:
 sphere('Study boot',(side*.23,-.12,.38),(.19,.36,.14),dark,figure)
 rod('Study lower leg',(side*.23,0,.43),(side*.25,.02,1.7),.16,porcelain,figure)
 sphere('Study knee',(side*.25,.02,1.65),(.18,.19,.21),porcelain,figure)
 rod('Study upper leg',(side*.25,.02,1.65),(side*.2,0,2.35),.22,porcelain,figure)
# Draped robe: a single original mesh, softly fluted, no borrowed model.
verts=[];faces=[];rings=[(.65,.65),(1.0,.59),(1.7,.47),(2.3,.38),(2.65,.43),(2.95,.60),(3.16,.58),(3.3,.28)]
for j,(z,r) in enumerate(rings):
 for k in range(72):
  t=2*pi*k/72;fold=.035*sin(t*12+z*.2);verts.append(((r+fold)*cos(t),(r*.58+fold)*sin(t),z))
for j in range(len(rings)-1):
 for k in range(72):a=j*72+k;b=j*72+(k+1)%72;faces.append((a,b,b+72,a+72))
mesh=bpy.data.meshes.new('Original robe mesh');mesh.from_pydata(verts,[],faces);mesh.update();o=bpy.data.objects.new('Unbranded clothed light-study form',mesh);bpy.context.collection.objects.link(o);finish(o,o.name,cloth,figure,0)
for p in mesh.polygons:p.use_smooth=True
rod('Study neck',(0,0,3.23),(0,0,3.5),.14,porcelain,figure)
sphere('Featureless study head',(0,-.01,3.76),(.28,.24,.39),porcelain,figure)
for side in [-1,1]:
 sphere('Study shoulder',(side*.58,0,3.05),(.21,.2,.22),cloth,figure)
 rod('Study sleeve',(side*.58,0,3.05),(side*.75,-.02,2.47),.16,cloth,figure)
 sphere('Study elbow',(side*.75,-.02,2.47),(.14,.14,.15),porcelain,figure)
 rod('Study forearm',(side*.75,-.02,2.47),(side*.65,-.18,2.03),.10,porcelain,figure)
 sphere('Study mitten',(side*.65,-.18,1.99),(.11,.095,.18),porcelain,figure)
# Warm directional light left, cool reflected fill right, cooler atmospheric distance.
area('Large warm side aperture',(-4.5,-.5,6.8),(0,0,1.4),(1.0,.79,.52),650,3.4)
area('Cold rear nave daylight',(2.5,11,6.5),(0,0,2.1),(.42,.62,1.0),900,5.0)
area('Quiet face bounce',(0,-5,4.8),(0,0,2),(.71,.80,1.0),50,4)
area('Far door haze',(0,24,5),(0,12,3),(.42,.55,.75),600,4)
# Actual low-density participating medium produces distance separation under the same light.
fog=bpy.data.materials.new('Distance atmosphere');fog.use_nodes=True;nodes=fog.node_tree.nodes;nodes.clear();output=nodes.new('ShaderNodeOutputMaterial');volume=nodes.new('ShaderNodeVolumePrincipled');volume.inputs['Density'].default_value=.004;volume.inputs['Color'].default_value=(.45,.53,.62,1);volume.inputs['Anisotropy'].default_value=.15;fog.node_tree.links.new(volume.outputs['Volume'],output.inputs['Volume']);box('Atmosphere volume',(0,16,5),(25,20,12),fog,bevel=0)
# Fixed perspective camera, all export passes share this exact projection.
bpy.ops.object.camera_add(location=(0,-8.6,3.45));cam=bpy.context.object;cam.rotation_euler=(Vector((0,2,2.35))-cam.location).to_track_quat('-Z','Y').to_euler();cam.data.lens=28;scene.camera=cam;cam.data.clip_end=150
# Export three perspective-matched photographic planes. The subject includes its support/contact shadow.
# This is an offline model study, never a runtime 3D renderer or gameplay implementation.
meshes=[o for o in scene.objects if o.type=='MESH']
subjects=set(figure+platform);front=set(foreground)
for name,keep,transparent in [('room',set(meshes)-subjects-front,False),('study-figure',subjects,True),('foreground',front,True)]:
 if only and name!=only:continue
 for o in meshes:o.hide_render=o not in keep
 scene.render.film_transparent=transparent
 scene.render.filepath=out+'/'+name+'.png'
 bpy.ops.render.render(write_still=True)
for o in meshes:o.hide_render=False
scene.render.film_transparent=False
bpy.ops.wm.save_as_mainfile(filepath=out+'/depth-study.blend')
with open(out+'/render-info.json','w') as f:json.dump({'renderer':bpy.app.version_string,'engine':scene.render.engine,'size':[scene.render.resolution_x,scene.render.resolution_y],'figure':'Original procedural faceless clothed mannequin; not a game Character','assets':'No external textures, meshes or fonts','camera':{'position':list(cam.location),'lensMm':cam.data.lens},'layers':['room.png','study-figure.png','foreground.png'],'maps':'No browser depth/normal maps; real offline geometry normals, lighting and shadows'},f,indent=2)
print('BELLIBING_LAYER_RENDER_DONE')
