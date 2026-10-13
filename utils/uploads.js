const fs = require('fs/promises');
const path = require('path');

const uploadsDir = path.join(__dirname, '..', 'uploads');

// Delete uploaded image files given their public '/uploads/<file>' paths. Never throws.
async function removeUploads(paths) {
  for (const p of paths || []) {
    try {
      const file = path.basename(String(p));
      if (!file) continue;
      await fs.unlink(path.join(uploadsDir, file));
    } catch (err) {
      if (err.code !== 'ENOENT') console.error('Failed to remove upload:', err.message);
    }
  }
}

module.exports = { removeUploads };
