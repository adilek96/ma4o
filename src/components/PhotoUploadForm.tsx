import React, { useState, useCallback, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "../hooks/useAuth";
import {
  uploadFileAction,
  deletePhotoAction,
  type MultipleUploadResponse,
  updatePhotoAction,
} from "../actions/fileUploadActions";

interface Photo {
  id: string;
  url: string;
  isUploading?: boolean;
  isMain?: boolean;
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
  const { user, refreshUserData } = useAuth();

  const [photos, setPhotos] = useState<Photo[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadingCount, setUploadingCount] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [selectedPhotoId, setSelectedPhotoId] = useState<string | null>(null);

  // Обновляем фотографии при изменении данных пользователя
  useEffect(() => {
    if (user?.photos && user.photos.length > 0) {
      setPhotos((prev) => {
        // Если фотографий еще нет в состоянии, добавляем их все
        if (prev.length === 0) {
          const newPhotos: Photo[] = user.photos!.map((photo) => ({
            id: photo.id,
            url: photo.url,
            isUploading: false,
            isMain: photo.isMain || false,
          }));
          return newPhotos;
        } else {
          // Если фотографии уже есть, обновляем только флаг isMain, сохраняя порядок
          const updatedPhotos = prev.map((existingPhoto) => {
            const serverPhoto = user.photos?.find(
              (p) => p.id === existingPhoto.id
            );
            if (serverPhoto) {
              return {
                ...existingPhoto,
                isMain: serverPhoto.isMain || false,
              };
            }
            return existingPhoto;
          });
          return updatedPhotos;
        }
      });
    } else if (user?.photos && user.photos.length === 0) {
      setPhotos([]);
    } else if (!user?.photos) {
      setPhotos([]);
    }
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

      // Создаем временные фото для каждого файла с base64
      const tempPhotos: Photo[] = [];
      const promises = validFiles.map((file, i) => {
        return new Promise<void>((resolve) => {
          const reader = new FileReader();
          const tempPhoto: Photo = {
            id: `temp-${Date.now()}-${i}`,
            url: "",
            isUploading: true,
          };

          tempPhotos.push(tempPhoto);

          reader.onload = (e) => {
            if (e.target?.result) {
              tempPhoto.url = e.target.result as string;
            }
            resolve();
          };
          reader.readAsDataURL(file);
        });
      });

      // Ждем загрузки всех изображений
      await Promise.all(promises);

      setPhotos((prev) => [...prev, ...tempPhotos]);
      setUploadingCount((prev) => prev + validFiles.length);

      try {
        const result: MultipleUploadResponse =
          await uploadFileAction(validFiles);

        if (result.success && result.photoData && result.photoData.length > 0) {
          // Обновляем фотографии с новыми URL и ID
          setPhotos((prev) => {
            const updatedPhotos = prev.map((photo) => {
              const tempIndex = tempPhotos.findIndex(
                (temp) => temp.id === photo.id
              );
              if (tempIndex !== -1 && result.photoData![tempIndex]) {
                const photoInfo = result.photoData![tempIndex];
                return {
                  ...photo,
                  id: photoInfo.id, // Используем реальный ID от сервера
                  url: photoInfo.url,
                  isUploading: false,
                };
              }
              return photo;
            });
            return updatedPhotos;
          });
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
      console.log("event", event.target);
      const files = event.target.files;
      if (!files || files.length === 0) {
        alert("Файл не выбран. Пожалуйста, разрешите доступ к фото/камера.");
        return;
      }
      handleFileUpload(Array.from(files));
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
          // Удаляем фото из состояния
          setPhotos((prev) => prev.filter((photo) => photo.id !== photoId));
          // Обновляем данные пользователя после удаления
          await refreshUserData();
        } else {
          alert(result.error || t("photoUpload.deleteError"));
        }
      } catch (error) {
        alert(t("photoUpload.deleteError"));
      }
    },
    [t, refreshUserData]
  );

  const handlePhotoClick = useCallback((photoId: string, isMain: boolean) => {
    if (isMain) return; // Не показываем диалог для главной фотографии
    setSelectedPhotoId(photoId);
    setShowConfirmDialog(true);
  }, []);

  const handleConfirmUpdatePhoto = useCallback(async () => {
    if (!selectedPhotoId) return;

    try {
      const result = await updatePhotoAction(selectedPhotoId);
      if (result.success) {
        // Обновляем данные пользователя с сервера
        await refreshUserData();
      } else {
        alert(result.error || t("photoUpload.updateError"));
      }
    } catch (error) {
      alert(t("photoUpload.updateError"));
    } finally {
      setShowConfirmDialog(false);
      setSelectedPhotoId(null);
    }
  }, [selectedPhotoId, t, refreshUserData]);

  const handleCancelUpdatePhoto = useCallback(() => {
    setShowConfirmDialog(false);
    setSelectedPhotoId(null);
  }, []);

  const handleNext = async () => {
    onSave(photos.filter((photo) => !photo.isUploading));
    // Обновляем данные пользователя после сохранения
    await refreshUserData();
    // Закрываем форму после обновления данных
    onClose();
  };

  // const handelTgPhoto = async () => {
  //   console.log("handelTgPhoto");
  //   if (window.Telegram?.WebApp) {
  //     const tg: any = window.Telegram.WebApp;
  //     console.log("tg", tg);
  //     // tg.openRequestDialog("photo", (result: any) => {
  //     //   console.log("result", result);
  //     // });
  //     // tg.onEvent("file_selected", (files: any[]) => {
  //     //   console.log("Выбранные файлы:", files);
  //     // });
  //     const files = await tg.showPicker({
  //       type: "photo",
  //       // multiple: false,
  //       // accept: ["image/*"],
  //       // capture: "environment",
  //     });
  //     console.log("Файл выбран:", files[0]);
  //   } else {
  //     alert("Please use Telegram WebApp to upload photos");
  //   }
  // };

  const canProceed = photos.length > 0 && uploadingCount === 0;

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
              accept="image/jpeg, image/jpg, image/png, image/heic, image/heif"
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
          {photos.length > 0 ? (
            <div>
              <h3 className="font-medium text-foreground mb-4">
                {t("photoUpload.uploadedPhotos")} ({photos.length})
              </h3>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {photos.map((photo, index) => {
                  return (
                    <div
                      onClick={() =>
                        handlePhotoClick(photo.id, photo.isMain || false)
                      }
                      key={photo.id}
                      className={`relative aspect-square rounded-xl overflow-hidden border component-bg transition-all duration-200 ${
                        photo.isMain
                          ? "border-2 border-purple-500 shadow-lg shadow-purple-500/30 cursor-default"
                          : "border border-border cursor-pointer hover:opacity-90 hover:border-purple-500/50"
                      }`}
                    >
                      <img
                        src={`${photo.url}`}
                        alt={`Photo ${index + 1}`}
                        className="w-full h-full object-cover"
                      />

                      {photo.isUploading && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                        </div>
                      )}

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeletePhoto(photo.id);
                        }}
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
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                {t("photoUpload.noPhotos")}
              </p>
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
        <div className="max-w-2xl mx-auto">
          <button
            onClick={handleNext}
            disabled={!canProceed}
            className="w-full px-8 py-4 rounded-xl border-border border-2 shadow-md component-bg text-foreground neon-purple-soft transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {t("photoUpload.next")}
          </button>
        </div>
      </div>

      {/* Диалог подтверждения */}
      {showConfirmDialog && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-background rounded-2xl border border-border p-6 max-w-sm w-full mx-4">
            <h3 className="text-lg font-bold text-foreground mb-4">
              {t("photoUpload.confirmMainPhoto")}
            </h3>
            <p className="text-sm text-muted-foreground mb-6">
              {t("photoUpload.confirmMainPhotoText")}
            </p>
            <div className="flex space-x-3">
              <button
                onClick={handleCancelUpdatePhoto}
                className="flex-1 px-8 py-4 rounded-xl border-border border-2 shadow-md component-bg text-foreground neon-purple-soft transition-all duration-200 font-medium"
              >
                {t("photoUpload.no")}
              </button>
              <button
                onClick={handleConfirmUpdatePhoto}
                className="flex-1 px-8 py-4 rounded-xl border-border border-2 shadow-md component-bg text-foreground neon-purple-soft transition-all duration-200 font-medium"
              >
                {t("photoUpload.yes")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
