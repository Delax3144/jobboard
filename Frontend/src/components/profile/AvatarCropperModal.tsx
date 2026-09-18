import styles from "./AvatarCropperModal.module.css";
import type { Area } from 'react-easy-crop';
import type { User } from '../../types/user';
import { useState, useCallback } from "react";
import Cropper from "react-easy-crop";
import Modal from "../../components/Modal";
import api from "../../lib/api";

const Icons = {
  ZoomOut: () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7" /></svg>,
  ZoomIn: () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" /></svg>,
};

export default function AvatarCropperModal({ open, onClose, imageSrc, setUser, setMessage }: { open: boolean; onClose: () => void; imageSrc: string | null; setUser: (user: User) => void; setMessage: (message: string) => void }) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [isAvatarSaving, setIsAvatarSaving] = useState(false);

  const onCropComplete = useCallback((_croppedArea: Area, croppedAreaPixels: Area) => {
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
    } catch { alert("Failed to upload avatar"); }
    finally { setIsAvatarSaving(false); }
  };

  return (
    <Modal open={open} title="Adjust your Profile Picture" onClose={onClose}>
      <div className={styles.container}>
        <p className={styles.description}>Drag to position, use the slider to zoom.</p>
        <div className={styles.frame}>
          {imageSrc && (
            <Cropper
              image={imageSrc} crop={crop} zoom={zoom} aspect={1} cropShape="round" showGrid={false}
              onCropChange={setCrop} onZoomChange={setZoom} onCropComplete={onCropComplete}
              classes={{ containerClassName: styles.cropper, cropAreaClassName: styles.cropArea }}
            />
          )}
        </div>
        <div className={styles.zoomControls}>
          <span className={styles.zoomIcon}><Icons.ZoomOut /></span>
          <input aria-label="Avatar zoom" type="range" value={zoom} min={1} max={3} step={0.1} onChange={(e) => setZoom(Number(e.target.value))} className={styles.slider} />
          <span className={styles.zoomIcon}><Icons.ZoomIn /></span>
        </div>
        <div className={styles.actions}>
          <button onClick={handleSaveCroppedAvatar} disabled={isAvatarSaving} className={styles.saveButton}>
            {isAvatarSaving ? "Saving..." : "Set as Profile Picture"}
          </button>
          <button onClick={onClose} className={styles.cancelButton}>Cancel</button>
        </div>
      </div>
    </Modal>
  );
}

const getCroppedImg = async (imageSrc: string, pixelCrop: Area): Promise<Blob | null> => {
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