const getLogin = (req, res, next) => {
  res.render("entry", {
    title: "Login - Odin's Archive",
    formData: {},
    errors: [],
    formType: "login",
  });
};

module.exports = { getLogin };
