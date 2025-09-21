
const asyncHandler = (requestHandler) =>{
  return (req,res,next)=>{
    Promise.resolve(requestHandler(req,res,next).catch((err)=>next(err)))
  }
}

export {asyncHandler}





/*

WITHOUT asyncHandler
const createUser = async (req, res, next) => {
  try {
    // An await call that might fail (e.g., database error)
    const user = await User.create(req.body);
    res.status(201).json(user);
  } catch (error) {
    // You MUST catch the error and pass it to next()
    next(error);
  }
};


// WITH asyncHandler
const createUser = asyncHandler(async (req, res, next) => {
  // The await call that might fail
  const user = await User.create(req.body);
  res.status(201).json(user);
  
  // No try...catch needed! The wrapper handles it.
});

*/