from PIL import Image
import os

input_path = "/home/ayayaie/Downloads/MetaHuman_Textures/T_Teeth_SRM.png"
output_dir = "/home/ayayaie/Downloads/MetaHuman_Textures/split"

os.makedirs(output_dir, exist_ok=True)

img = Image.open(input_path)
r, g, b, a = img.split()

# SR_MF channel mapping:
# R = Smoothing
# G = Roughness  
# B = Metallic
# A = Fluorescence (rarely needed in Three.js)

r.save(os.path.join(output_dir, "teeth_Smoothing.png"))
g.save(os.path.join(output_dir, "teeth_Roughness.png"))
b.save(os.path.join(output_dir, "teeth_Metallic.png"))

print("Done! Channels split.")