import { revalidatePath } from "next/cache";

export function revalidateLocales(paths: string[]) {
  for (const path of paths) {
    revalidatePath(path);
  }
}

export function revalidatePublicLocales(base: string, slug?: string) {
  revalidatePath(`/fr${base}`);
  revalidatePath(`/ar${base}`);
  if (slug) {
    revalidatePath(`/fr${base}/${slug}`);
    revalidatePath(`/ar${base}/${slug}`);
  }
}
