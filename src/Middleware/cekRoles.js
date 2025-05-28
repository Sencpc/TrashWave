// Middleware cekRoles untuk playlist: hanya user biasa yang boleh membuat playlist
module.exports = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ msg: 'Unauthorized' });
  }
  if (req.user.role !== 'user') {
    return res.status(403).json({ msg: 'Hanya user biasa yang boleh membuat playlist' });
  }
  next();
};
