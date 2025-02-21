const getLanding = (req, res, next) => {
  res.render("landing", {
    title: "Odin's Archive",
  });
};

module.exports = { getLanding };
