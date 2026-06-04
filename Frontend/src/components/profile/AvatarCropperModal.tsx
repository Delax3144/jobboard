// src/components/profile/AvatarCropperModal.tsx
import { useState, useCallback } from "react";
import Cropper from "react-easy-crop";
import Modal from "../../components/Modal";
import api from "../../lib/api";

const Icons = {
  ZoomOut: () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7" /></svg>,
  ZoomIn: () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" /></svg>,
};

export default function AvatarCropperModal({ open, onClose, imageSrc, setUser, setMessage }: any) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
  const [isAvatarSaving, setIsAvatarSaving] = useState(false);

  const onCropComplete = useCallback((_croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleSaveCroppedAvatar = async () => {
    if (!imageSrc || !croppedAreaPixels) return;
    setIsAvatarSaving(true);
    try {
      const croppedImageBlob = await getCroppedImg(imageSrc, croppedAreaPixels);
      if (!croppedImageBlob) throw new Error("Crop failed");
      const formData = new FormData();
      formData.append("avatar", croppedImageBlob, "avatar.jpg");
      const res = await api.post("/auth/avatar", formData, { headers: { "Content-Type": "multipart/form-data" } });
      setUser(res.data.user);
      onClose();
      setMessage("Avatar updated successfully! 📸");
      setTimeout(() => setMessage(""), 3000);
    } catch (err) { alert("Failed to upload avatar"); } 
    finally { setIsAvatarSaving(false); }
  };

  return (
    <Modal open={open} title="Adjust your Profile Picture" onClose={onClose}>
      <div className="prof-cropper-modal-container">
        <p style={{ color: '#888', marginTop: 0, marginBottom: '25px', fontSize: '15px' }}>Drag to position, use the slider to zoom.</p>
        <div className="prof-cropper-frame-view" style={{ position: 'relative', width: '100%', height: '350px', background: '#000', borderRadius: '20px', overflow: 'hidden', border: '1px solid #222', marginBottom: '25px' }}>
          {imageSrc && (
            <Cropper
              image={imageSrc} crop={crop} zoom={zoom} aspect={1} cropShape="round" showGrid={false}
              onCropChange={setCrop} onZoomChange={setZoom} onCropComplete={onCropComplete}
              style={{ containerStyle: { background: '#000' }, cropAreaStyle: { border: '2px solid #10b981', boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.85)' } }}
            />
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px', padding: '0 10px', marginBottom: '35px' }}>
          <span style={{ color: '#555' }}><Icons.ZoomOut /></span>
          <input type="range" value={zoom} min={1} max={3} step={0.1} onChange={(e) => setZoom(Number(e.target.value))} style={{ flex: 1, cursor: 'pointer', accentColor: '#10b981', background: '#222', height: '4px', borderRadius: '2px', appearance: 'none', outline: 'none' }} />
          <span style={{ color: '#555' }}><Icons.ZoomIn /></span>
        </div>
        <div className="prof-cropper-actions" style={{ display: 'flex', gap: '15px', borderTop: '1px solid #1a1a1a', paddingTop: '25px' }}>
          <button onClick={handleSaveCroppedAvatar} disabled={isAvatarSaving} className="btn btnPrimary pill" style={{ flex: 1, padding: '16px', fontSize: '15px', fontWeight: 800 }}>
            {isAvatarSaving ? "Saving..." : "Set as Profile Picture"}
          </button>
          <button onClick={onClose} className="btn pill" style={{ padding: '16px 25px', background: '#111', color: '#888', border: '1px solid #333' }}>Cancel</button>
        </div>
      </div>
    </Modal>
  );
}

const getCroppedImg = async (imageSrc: string, pixelCrop: any): Promise<Blob | null> => {
  const image = await createImage(imageSrc);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;
  canvas.width = pixelCrop.width; canvas.height = pixelCrop.height;
  ctx.drawImage(image, pixelCrop.x, pixelCrop.y, pixelCrop.width, pixelCrop.height, 0, 0, pixelCrop.width, pixelCrop.height);
  return new Promise((resolve) => canvas.toBlob((blob) => resolve(blob), 'image/jpeg', 0.9));
};

const createImage = (url: string): Promise<HTMLImageElement> => new Promise((resolve, reject) => {
  const image = new Image();
  image.addEventListener('load', () => resolve(image));
  image.addEventListener('error', (error) => reject(error));
  image.setAttribute('crossOrigin', 'anonymous');
  image.src = url;
});