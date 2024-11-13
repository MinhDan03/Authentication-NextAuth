import { getSession } from 'next-auth/react';
import { getToken } from "next-auth/jwt"
import { hashPassword, verifyPassword } from '../../../lib/auth';
import { connectToDatabase } from '../../../lib/db';
// import { getToken } from "next-auth/jwt"

const secret = process.env.NEXTAUTH_SECRET;
async function handler(req, res) {
  if (req.method !== 'PATCH') {
    return;
  }
  const token = await getToken({ req, secret })
//   console.log("JSON Web Token", token)
  if (!token) {
        res.status(401).json({ message: 'Not Token!' });
        return;
      }
//   const session = await getSession({ req });
// if (!session) {
//   console.log('Session không tồn tại hoặc không hợp lệ.');
//   console.log('Cookies:', req.headers.cookie);
//   console.log('CSRF Token:', req.body?.csrfToken);
//   res.status(401).json({ message: 'Not authenticated!' });
//   return;
// }
//   const session = await getSession({req: req});

// //   console.log(session);
//   if (!session) {
//     res.status(401).json({ message: 'Not authenticated!' });
//     return;
//   }


  const userEmail = token.email;
  const oldPassword = req.body.oldPassword;
  const newPassword = req.body.newPassword;

  const client = await connectToDatabase();

  const usersCollection = client.db().collection('users');

  const user = await usersCollection.findOne({ email: userEmail });

  if (!user) {
    res.status(404).json({ message: 'User not found.' });
    client.close();
    return;
  }

  const currentPassword = user.password;

  const passwordsAreEqual = await verifyPassword(oldPassword, currentPassword);

  if (!passwordsAreEqual) {
    res.status(403).json({ message: 'Invalid password.' });
    client.close();
    return;
  }

  const hashedPassword = await hashPassword(newPassword);

  const result = await usersCollection.updateOne(
    { email: userEmail },
    { $set: { password: hashedPassword } }
  );

  client.close();
  res.status(200).json({ message: 'Password updated!' });
}

export default handler;