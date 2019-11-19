

function validateBearerToken(req,res,next){
  const auth = req.get('Authorization');
  const apiToken = process.env.API_TOKEN;
  if(!auth || auth.split(' ')[1] !== apiToken){
    return res.status(401).json({error: 'Unauthorized request'});
  }
  next();
}


module.exports = validateBearerToken;