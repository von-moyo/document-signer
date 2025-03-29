import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export type IFilesWithPreview = {
  file: File;
  preview: string;
}[];

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const convertFileToDataUrl = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
  });
};

export const convertDataUrlToFile = (dataUrl: string, filename: string): File => {
  const arr = dataUrl.split(",");
  const match = arr[0].match(/:(.*?);/);

  if (!match) {
      throw new Error("Invalid data URL format");
  }

  const mime = match[1];
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);

  while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
  }

  return new File([u8arr], filename, { type: mime });
};

export function isFileWithPreview(file: IFilesWithPreview[number]) {
  return "preview" in file && typeof file.preview === "string";
}

export const isDataUrlPdf = (dataUrl: string) => {
  return dataUrl.startsWith("data:application/pdf");
};