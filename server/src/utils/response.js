const sendSuccess = (res, data = {}, message = 'Operation successful', statusCode = 200) => {
  return res.status(statusCode).json({ success: true, message, data });
};

const sendError = (res, error = 'An error occurred', statusCode = 500) => {
  return res.status(statusCode).json({ success: false, error });
};

const sendPaginated = (res, data, total, page, limit, message = 'Data fetched successfully') => {
  return res.status(200).json({
    success: true, message, data,
    pagination: {
      total,
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      totalPages: Math.ceil(total / limit),
    },
  });
};

module.exports = { sendSuccess, sendError, sendPaginated };