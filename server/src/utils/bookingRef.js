const generateBookingRef = () => {
  const date = new Date();
  const datePart = date.toISOString().slice(0, 10).replace(/-/g, '');
  const randomPart = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `TXI-${datePart}-${randomPart}`;
};

module.exports = { generateBookingRef };