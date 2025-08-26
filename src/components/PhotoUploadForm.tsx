import { useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import {
  uploadFileAction,
  deletePhotoAction,
  type UploadResponse,
} from "../actions/fileUploadActions";

interface Photo {
  id: string;
  url: string;
  isUploading?: boolean;
}

interface PhotoUploadFormProps {
  onClose: () => void;
  onSave: (photos: Photo[]) => void;
  initialPhotos?: Photo[];
}

export default function PhotoUploadForm({
  onClose,
  onSave,
  initialPhotos = [],
}: PhotoUploadFormProps) {
  const { t } = useTranslation();
  const [photos, setPhotos] = useState<Photo[]>(initialPhotos);
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadingCount, setUploadingCount] = useState(0);

  const handleFileUpload = useCallback(
    async (file: File) => {
      // Проверяем тип файла
      if (!file.type.startsWith("image/")) {
        alert(t("photoUpload.invalidFileType"));
        return;
      }

      // Проверяем размер файла (максимум 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert(t("photoUpload.fileTooLarge"));
        return;
      }

      // Создаем временный ID для фото
      const tempId = `temp-${Date.now()}`;
      const tempPhoto: Photo = {
        id: tempId,
        url: URL.createObjectURL(file),
        isUploading: true,
      };

      setPhotos((prev) => [...prev, tempPhoto]);
      setUploadingCount((prev) => prev + 1);

      try {
        const result: UploadResponse = await uploadFileAction(file);

        if (result.success && result.url) {
          setPhotos((prev) =>
            prev.map((photo) =>
              photo.id === tempId
                ? { ...photo, url: result.url!, isUploading: false }
                : photo
            )
          );
        } else {
          // Удаляем неудачное фото
          setPhotos((prev) => prev.filter((photo) => photo.id !== tempId));
          alert(result.error || t("photoUpload.uploadError"));
        }
      } catch (error) {
        setPhotos((prev) => prev.filter((photo) => photo.id !== tempId));
        alert(t("photoUpload.uploadError"));
      } finally {
        setUploadingCount((prev) => prev - 1);
      }
    },
    [t]
  );

  const handleFileSelect = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const files = event.target.files;
      if (files) {
        Array.from(files).forEach(handleFileUpload);
      }
    },
    [handleFileUpload]
  );

  const handleDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      setIsDragOver(false);

      const files = event.dataTransfer.files;
      if (files) {
        Array.from(files).forEach(handleFileUpload);
      }
    },
    [handleFileUpload]
  );

  const handleDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDeletePhoto = useCallback(
    async (photoId: string) => {
      try {
        const result = await deletePhotoAction(photoId);
        if (result.success) {
          setPhotos((prev) => prev.filter((photo) => photo.id !== photoId));
        } else {
          alert(result.error || t("photoUpload.deleteError"));
        }
      } catch (error) {
        alert(t("photoUpload.deleteError"));
      }
    },
    [t]
  );

  const handleSave = () => {
    onSave(photos.filter((photo) => !photo.isUploading));
  };

  const canSave = photos.length > 0 && uploadingCount === 0;

  return (
    <div className="fixed inset-0 bg-background z-40 animate-in fade-in duration-300 flex flex-col">
      {/* Заголовок */}
      <div className="flex-shrink-0 component-bg border-b border-border px-4 py-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <button
              onClick={onClose}
              className="p-2 rounded-xl border border-border component-bg hover:border-primary/50 transition-all duration-200"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
            <div>
              <h1 className="text-lg font-bold text-foreground">
                {t("photoUpload.title")}
              </h1>
              <p className="text-sm text-muted-foreground">
                {t("photoUpload.subtitle")}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Основной контент */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="max-w-2xl mx-auto pb-4 space-y-6">
          <h2 className="text-2xl font-bold text-center mb-6 gradient-text">
            {t("photoUpload.setupTitle")}
          </h2>

          {/* Drag & Drop зона */}
          <div
            className={`relative border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-200 ${
              isDragOver
                ? "border-primary bg-primary/10"
                : "border-border component-bg hover:border-primary/50"
            }`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
          >
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileSelect}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />

            <div className="space-y-4">
              <div className="w-16 h-16 mx-auto bg-primary/20 rounded-full flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-primary"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                  />
                </svg>
              </div>

              <div>
                <p className="text-lg font-medium text-foreground">
                  {t("photoUpload.dragDropTitle")}
                </p>
                <p className="text-sm text-foreground/70 mt-2">
                  {t("photoUpload.dragDropSubtitle")}
                </p>
              </div>

              <button className="px-6 py-3 bg-primary text-primary-foreground rounded-xl font-medium hover:bg-primary/90 transition-colors">
                {t("photoUpload.selectFiles")}
              </button>
            </div>
          </div>

          {/* Требования */}
          <div className="p-4 rounded-2xl border border-border component-bg">
            <h3 className="font-medium text-foreground mb-3">
              {t("photoUpload.requirements")}
            </h3>
            <ul className="text-sm text-foreground/70 space-y-1">
              <li>• {t("photoUpload.maxFileSize")}</li>
              <li>• {t("photoUpload.supportedFormats")}</li>
              <li>• {t("photoUpload.maxPhotos")}</li>
            </ul>
          </div>

          {/* Загруженные фотографии */}
          {photos.length > 0 && (
            <div>
              <h3 className="font-medium text-foreground mb-4">
                {t("photoUpload.uploadedPhotos")} ({photos.length}/6)
              </h3>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {photos.map((photo, index) => (
                  <div
                    key={photo.id}
                    className="relative aspect-square rounded-xl overflow-hidden border border-border component-bg"
                  >
                    <img
                      src={photo.url}
                      alt={`Photo ${index + 1}`}
                      className="w-full h-full object-cover"
                    />

                    {photo.isUploading && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                      </div>
                    )}

                    <button
                      onClick={() => handleDeletePhoto(photo.id)}
                      disabled={photo.isUploading}
                      className="absolute top-2 right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors disabled:opacity-50"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>

                    <div className="absolute bottom-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
                      {index + 1}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Прогресс загрузки */}
          {uploadingCount > 0 && (
            <div className="p-4 rounded-2xl border border-border component-bg">
              <div className="flex items-center space-x-3">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
                <span className="text-sm text-foreground">
                  {t("photoUpload.uploading", { count: uploadingCount })}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Фиксированная кнопка внизу */}
      <div className="flex-shrink-0 component-bg border-t border-border px-4 py-4">
        <div className="max-w-2xl mx-auto flex space-x-3">
          <button
            onClick={onClose}
            className="flex-1 px-6 py-3 rounded-xl border border-border component-bg text-foreground hover:border-primary/50 transition-all duration-200"
          >
            {t("photoUpload.cancel")}
          </button>
          <button
            onClick={handleSave}
            disabled={!canSave}
            className="flex-1 px-6 py-3 bg-primary text-primary-foreground rounded-xl font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {t("photoUpload.save")}
          </button>
        </div>
      </div>
    </div>
  );
}
