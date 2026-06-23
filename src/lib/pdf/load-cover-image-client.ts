export async function loadCoverImageClient(): Promise<string> {
  const response = await fetch("/assets/cover-livre-dor.jpg");
  if (!response.ok) {
    throw new Error("Impossible de charger la couverture du livre");
  }
  const blob = await response.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error("Erreur lecture couverture"));
    reader.readAsDataURL(blob);
  });
}
