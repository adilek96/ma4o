
export interface UploadResponse {
  success: boolean;
  url?: string;
  error?: string;
}

export interface MultipleUploadResponse {
  success: boolean;
  urls?: string[];
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
    fileArray.forEach((file) => {
      formData.append("files", file);
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

    return {
      success: true,
      urls: data.urls
    };
    
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

    const response = await fetch(`${baseUrl}/api/v1/user/photo/${fileId}`, {
      method: "DELETE",
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.success) {
      return { success: true };
    } else {
      return {
        success: false,
        error: data.error || "Ошибка удаления файла"
      };
    }
  } catch (error) {
    console.error("Ошибка удаления файла:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Неизвестная ошибка"
    };
  }
}         