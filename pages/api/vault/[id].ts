// pages/api/vault/[id].ts
import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '../../../lib/dbConnect';
import VaultItem from '../../../models/VaultItem';
import jwt from 'jsonwebtoken';

interface DecodedToken {
  userId: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const {
    query: { id },
    method,
  } = req;

  await dbConnect();

  // --- Authentication Check ---
  const { authorization } = req.headers;
  if (!authorization) {
    return res.status(401).json({ message: 'Authorization header missing' });
  }
  const token = authorization.split(' ')[1];
  let decodedToken;
  try {
    decodedToken = jwt.verify(token, process.env.JWT_SECRET!) as DecodedToken;
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
  const userId = decodedToken.userId;
  // --- End Authentication Check ---

  switch (method) {
    case 'PUT' /* Edit a specific item */:
      try {
        const vaultItem = await VaultItem.findById(id);
        if (!vaultItem || vaultItem.userId.toString() !== userId) {
          return res.status(404).json({ success: false, message: 'Item not found or you do not have permission.' });
        }
        const updatedItem = await VaultItem.findByIdAndUpdate(id, req.body, {
          new: true,
          runValidators: true,
        });
        res.status(200).json({ success: true, data: updatedItem });
      } catch (error) {
        res.status(400).json({ success: false });
      }
      break;

    case 'DELETE' /* Delete a specific item */:
      try {
        const vaultItem = await VaultItem.findById(id);
        if (!vaultItem || vaultItem.userId.toString() !== userId) {
          return res.status(404).json({ success: false, message: 'Item not found or you do not have permission.' });
        }
        await VaultItem.deleteOne({ _id: id });
        res.status(200).json({ success: true, data: {} });
      } catch (error) {
        res.status(400).json({ success: false });
      }
      break;

    default:
      res.setHeader('Allow', ['PUT', 'DELETE']);
      res.status(405).end(`Method ${method} Not Allowed`);
      break;
  }
}