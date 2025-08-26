
export interface UploadResponse {
  success: boolean;
  url?: string;
  error?: string;
}

export async function uploadFileAction(file: File): Promise<UploadResponse> {
  try {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch("/api/v1/user/photo/upload", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.success) {
      return {
        success: true,
        url: data.url
      };
    } else {
      return {
        success: false,
        error: data.error || "Ошибка загрузки файла"
      };
    }
  } catch (error) {
    console.error("Ошибка загрузки файла:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Неизвестная ошибка"
    };
  }
}

export async function deletePhotoAction(photoId: string): Promise<UploadResponse> {
  try {
    const response = await fetch(`/api/v1/user/photo/${photoId}`, {
      method: "DELETE",
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