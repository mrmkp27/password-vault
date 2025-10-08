// pages/api/vault/index.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '../../../lib/dbConnect';
import VaultItem from '../../../models/VaultItem';
import jwt from 'jsonwebtoken';

// Define a type for the decoded token payload
interface DecodedToken {
  userId: string;
  // Add other properties from your token payload if they exist
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  await dbConnect();

  // --- Authentication Check ---
  const { authorization } = req.headers;
  if (!authorization) {
    return res.status(401).json({ message: 'Authorization header missing' });
  }

  const token = authorization.split(' ')[1]; // Bearer <token>
  let decodedToken;

  try {
    decodedToken = jwt.verify(token, process.env.JWT_SECRET!) as DecodedToken;
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }

  const userId = decodedToken.userId;
  // --- End Authentication Check ---

  switch (req.method) {
    case 'GET':
      try {
        const vaultItems = await VaultItem.find({ userId: userId });
        res.status(200).json({ success: true, data: vaultItems });
      } catch (error) {
        res.status(400).json({ success: false, message: 'Error fetching items.' });
      }
      break;

    case 'POST':
      try {
        // Add the userId from the token to the request body
        const vaultItemData = { ...req.body, userId };
        const vaultItem = await VaultItem.create(vaultItemData);
        res.status(201).json({ success: true, data: vaultItem });
      } catch (error) {
        res.status(400).json({ success: false, message: 'Error creating item.' });
      }
      break;

    default:
      res.setHeader('Allow', ['GET', 'POST']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
      break;
  }
}