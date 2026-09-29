# 卡面批量裁切工具

将你在网上收集到的任何尺寸的原始图片，批量居中裁切为 Apple Wallet 视网膜规范的标准比例（1536 × 969）。

## 使用方法

1. 安装依赖：
   ```bash
   pip install Pillow
   ```

2. 准备图片：
   将你需要处理的图片（PNG、JPG、WEBP）放入项目根目录下的 `raw_cards` 文件夹中。

3. 运行脚本：
   ```bash
   python scripts/crop_cards.py
   ```

处理完成的标准化高清图片将自动输出到 `public/cards/` 目录下，您可以直接在 CardCraft 项目中通过 `/cards/文件名.png` 的相对路径进行引用。
