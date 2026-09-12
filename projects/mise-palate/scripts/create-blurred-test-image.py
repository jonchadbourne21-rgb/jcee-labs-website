from PIL import Image, ImageFilter

source = "/home/ubuntu/webdev-static-assets/mise-ingredients.jpg"
target = "/home/ubuntu/mise-palate/docs/test-evidence/unclear-ingredients.jpg"
image = Image.open(source).convert("RGB")
image = image.resize((220, 165)).filter(ImageFilter.GaussianBlur(radius=18))
image.save(target, quality=58)
print(target)
