const getSignUp = (req, res, next) => {
  res.render("entry", {
    title: "Sign up - Odin's Archive",
    formData: {},
    errors: [],
    formType: "signup",
  });
};

module.exports = { getSignUp };
