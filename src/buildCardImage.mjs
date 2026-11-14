// Normalize transport only; recognition, dimensions and source checks still
// belong to the existing scanner. Keep the original file as scan evidence.
export async function scannerImage(file) {
 if(!file||!file.size||file.size>5*1024*1024)throw Error('Choose a build image up to 5 MiB.');
 const type=file.type||({jpg:'image/jpeg',jpeg:'image/jpeg',png:'image/png',webp:'image/webp'}[file.name?.split('.').pop().toLowerCase()]);
 if(!['image/jpeg','image/png','image/webp'].includes(type))throw Error('Use JPEG, PNG or WebP.');
 if(type!=='image/webp')return file.type?file:new File([file],file.name,{type});
 const bitmap=await createImageBitmap(file);
 try{
  if(bitmap.width!==1920||bitmap.height!==1080)throw Error('Use the original 1920 × 1080 build card.');
  const canvas=document.createElement('canvas');canvas.width=bitmap.width;canvas.height=bitmap.height;
  canvas.getContext('2d').drawImage(bitmap,0,0);
  const blob=await new Promise(resolve=>canvas.toBlob(resolve,'image/png'));
  if(!blob||blob.size>5*1024*1024)throw Error('Decoded image exceeds the scanner limit.');
  return new File([blob],file.name.replace(/\.webp$/i,'.png'),{type:'image/png'});
 }finally{bitmap.close();}
}
