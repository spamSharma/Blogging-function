// api/auth.js
import ImageKit from "imagekit";

const imagekit = new ImageKit({
  publicKey: "public_dGeUs0LnIL2kLt0XbRDTNrZLcYg=",
  privateKey: "private_+rq/zIFyUMEfHeQuwn0V4gAUkFQ=",
  urlEndpoint: "https://ik.imagekit.io/y2x3yxbrx"
});

export default function handler(req, res) {
  const result = imagekit.getAuthenticationParameters();
  res.status(200).json(result);
}
