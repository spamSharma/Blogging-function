// api/auth.js
const ImageKit = require("imagekit");

const imagekit = new ImageKit({
  publicKey: "public_dGeUs0LnIL2kLt0XbRDTNrZLcYg=",
  privateKey: "private_+rq/zIFyUMEfHeQuwn0V4gAUkFQ=",
  urlEndpoint: "https://ik.imagekit.io/y2x3yxbrx"
});

module.exports = (req, res) => {
  try {
    const result = imagekit.getAuthenticationParameters();
    res.status(200).json(result);
  } catch (err) {
    console.error("ImageKit auth error:", err);
    res.status(500).json({ error: "Auth server error" });
  }
};
