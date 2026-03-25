import unreal
import os

baked_path = "/Game/MetaHumans/Test_MH/Face/Baked"
output_dir = "C:/Users/Eleve/Documents/MetaHuman_Textures"

os.makedirs(output_dir, exist_ok=True)

assets = unreal.EditorAssetLibrary.list_assets(baked_path, recursive=False)
print(f"Found {len(assets)} assets")

for asset_ref in assets:
    asset = unreal.EditorAssetLibrary.load_asset(asset_ref)
    
    if asset is None or not isinstance(asset, unreal.Texture2D):
        print(f"Skipping {asset_ref}")
        continue

    name = asset.get_name()
    export_path = os.path.join(output_dir, f"{name}.png").replace("\\", "/")

    exporter = unreal.TextureExporterPNG()
    task = unreal.AssetExportTask()
    task.object = asset
    task.filename = export_path
    task.selected = False
    task.replace_identical = True
    task.prompt = False

    result = exporter.run_asset_export_task(task)
    print(f"{'OK' if result else 'FAILED'}: {name}")

print("Done!")