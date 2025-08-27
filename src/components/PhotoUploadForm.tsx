import React, { useState, useCallback, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "../hooks/useAuth";
import {
  uploadFileAction,
  deletePhotoAction,
  type MultipleUploadResponse,
} from "../actions/fileUploadActions";

interface Photo {
  id: string;
  url: string;
  isUploading?: boolean;
}

interface PhotoUploadFormProps {
  onClose: () => void;
  onSave: (photos: Photo[]) => void;
}

export default function PhotoUploadForm({
  onClose,
  onSave,
}: PhotoUploadFormProps) {
  const { t } = useTranslation();
  const { user } = useAuth();

  // Преобразуем фотографии из user.photos в формат Photo
  const initialPhotos: Photo[] =
    user?.photos?.map((photo) => ({
      id: photo.id,
      url: photo.url,
      isUploading: false,
    })) || [];

  const [photos, setPhotos] = useState<Photo[]>(initialPhotos);
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadingCount, setUploadingCount] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Обновляем фотографии при изменении данных пользователя
  useEffect(() => {
    const updatedPhotos: Photo[] =
      user?.photos?.map((photo) => ({
        id: photo.id,
        url: photo.url,
      })) || [];
    setPhotos(updatedPhotos);
  }, [user?.photos]);

  const handleFileUpload = useCallback(
    async (files: File[]) => {
      // Очищаем предыдущую ошибку
      setUploadError(null);

      // Фильтруем и валидируем файлы
      const validFiles = files.filter((file) => {
        if (!file.type.startsWith("image/")) {
          setUploadError(t("photoUpload.invalidFileType"));
          return false;
        }
        if (file.size > 5 * 1024 * 1024) {
          setUploadError(t("photoUpload.fileTooLarge"));
          return false;
        }
        return true;
      });

      if (validFiles.length === 0) return;

      // Создаем временные фото для каждого файла
      const tempPhotos: Photo[] = validFiles.map((file, index) => ({
        id: `temp-${Date.now()}-${index}`,
        url: URL.createObjectURL(file),
        isUploading: true,
      }));

      setPhotos((prev) => [...prev, ...tempPhotos]);
      setUploadingCount((prev) => prev + validFiles.length);

      try {
        const result: MultipleUploadResponse = await uploadFileAction(
          validFiles
        );

        if (result.success && result.urls && result.urls.length > 0) {
          // Обновляем страницу для получения новых данных
          window.location.reload();
        } else {
          // Удаляем неудачные фото
          setPhotos((prev) =>
            prev.filter(
              (photo) => !tempPhotos.some((temp) => temp.id === photo.id)
            )
          );
          setUploadError(result.error || t("photoUpload.uploadError"));
        }
      } catch (error) {
        setPhotos((prev) =>
          prev.filter(
            (photo) => !tempPhotos.some((temp) => temp.id === photo.id)
          )
        );
        setUploadError(t("photoUpload.uploadError"));
      } finally {
        setUploadingCount((prev) => prev - validFiles.length);
      }
    },
    [t]
  );

  const handleFileSelect = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const files = event.target.files;
      if (files) {
        handleFileUpload(Array.from(files));
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
        handleFileUpload(Array.from(files));
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
          // Обновляем страницу для получения новых данных
          window.location.reload();
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

  console.log("photos", photos);

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

          {/* Прогресс загрузки и ошибки */}
          {(uploadingCount > 0 || uploadError) && (
            <div className="p-4 rounded-2xl border border-border component-bg">
              {uploadingCount > 0 && (
                <div className="flex items-center space-x-3 mb-3">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
                  <span className="text-sm text-foreground">
                    {t("photoUpload.uploading", { count: uploadingCount })}
                  </span>
                </div>
              )}
              {uploadError && (
                <div className="text-sm text-red-500 font-medium">
                  {uploadError}
                </div>
              )}
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
