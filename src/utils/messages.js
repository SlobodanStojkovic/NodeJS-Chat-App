const generateMessage = (text) => {
  return {
    text,
    createdAt: new Date().getTime(),
  };
};

const generateLocationMessages = (url) => {
  return {
    url,
    createdAt: new Date().getTime(),
  };
};

module.exports = {
  generateMessage,
  generateLocationMessages,
};
