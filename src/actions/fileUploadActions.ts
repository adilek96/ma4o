
export interface UploadResponse {
  success: boolean;
  url?: string;
  error?: string;
}

export interface MultipleUploadResponse {
  success: boolean;
  urls?: string[];
  photoData?: Array<{ id: string; url: string }>;
  error?: string;
}

export async function uploadFileAction(files: File | File[]): Promise<MultipleUploadResponse> {
  try {
    const aplication = import.meta.env.VITE_APPLICATION;
    const baseUrlDev = import.meta.env.VITE_BASE_API_URL_DEV;
    const baseUrlProd = import.meta.env.VITE_BASE_API_URL_PROD;
    const baseUrl = aplication === "production" ? baseUrlProd : baseUrlDev;

    // Преобразуем в массив, если передан один файл
    const fileArray = Array.isArray(files) ? files : [files];
    
    const formData = new FormData();
    
    // Добавляем все файлы в FormData
    fileArray.forEach((file, index) => {
      formData.append(`files[${index}]`, file);
    });



    const response = await fetch(`${baseUrl}/api/v1/user/photo/upload`, {
      method: "POST",
      credentials: 'include',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

        const data = await response.json();

    // Обрабатываем ответ сервера
    if (data.message === 'success' && data.photos) {
      const photoData = data.photos.map((photo: any) => {
        let url = photo.url;
        // Если URL начинается с /, добавляем базовый URL сервера
        if (url.startsWith('/')) {
          url = `${baseUrl}${url}`;
        }
        return {
          id: photo.id,
          url: url
        };
      });

      return {
        success: true,
        urls: photoData.map((p: { id: string; url: string }) => p.url),
        photoData: photoData, // Добавляем полные данные фотографий
        error: undefined
      };
    }

    return {
      success: false,
      urls: [],
      error: "Неверный формат ответа от сервера"
    }
    
  } catch (error) {
    console.error("Ошибка загрузки файлов:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Неизвестная ошибка"
    };
  }
}

export async function deletePhotoAction(fileId: string): Promise<UploadResponse> {
  try {
    const aplication = import.meta.env.VITE_APPLICATION;
    const baseUrlDev = import.meta.env.VITE_BASE_API_URL_DEV;
    const baseUrlProd = import.meta.env.VITE_BASE_API_URL_PROD;
    const baseUrl = aplication === "production" ? baseUrlProd : baseUrlDev;

   

    const response = await fetch(`${baseUrl}/api/v1/user/photo/delete/${fileId}`, {
      method: "DELETE",
      credentials: 'include',
    });
    

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return {
      success: true,
      
    }
    
   
  } catch (error) {
    console.error("Ошибка удаления файла:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Неизвестная ошибка"
    };
  }
}         


export async function updatePhotoAction(photoId: string): Promise<UploadResponse> {
try {
  const aplication = import.meta.env.VITE_APPLICATION;
    const baseUrlDev = import.meta.env.VITE_BASE_API_URL_DEV;
    const baseUrlProd = import.meta.env.VITE_BASE_API_URL_PROD;
    const baseUrl = aplication === "production" ? baseUrlProd : baseUrlDev;

   

    const response = await fetch(`${baseUrl}/api/v1/user/photo/update`, {
      method: "PATCH",
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        photoId: photoId
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('updatePhotoAction: ответ от сервера', data);

    return {
      success: true,
      
    }
    

} catch (error) {
  console.error("Ошибка обновления фотографии:", error);
  return {
    success: false,
    error: error instanceof Error ? error.message : "Неизвестная ошибка"
  };
}}