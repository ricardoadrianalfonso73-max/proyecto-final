
const jwt = require('jsonwebtoken');

// Verificar que el usuario tenga un token válido
function verificarToken(req, res, next) {
  try {
    const encabezado = req.headers.authorization;

    if (!encabezado || !encabezado.startsWith('Bearer ')) {
      return res.status(401).json({
        mensaje: 'No estás autorizado. Iniciá sesión.'
      });
    }

    const token = encabezado.split(' ')[1];

    const datos = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    req.usuario = datos;

    next();

  } catch (error) {
    return res.status(401).json({
      mensaje: 'La sesión es inválida o ha vencido.'
    });
  }
}

// Verificar que el usuario sea administrador
function verificarAdmin(req, res, next) {
  if (!req.usuario || req.usuario.rol !== 'admin') {
    return res.status(403).json({
      mensaje: 'No tenés permisos de administrador.'
    });
  }

  next();
}

module.exports = {
  verificarToken,
  verificarAdmin
};
