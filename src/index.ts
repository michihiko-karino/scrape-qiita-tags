import { Request, Response } from 'express';
import getPagesByTag from './getPagesByTag';

export const getQiitaPagesByTagPage = (req: Request, res: Response) => {
  const { tagname } = req.query;

  if (!tagname) {
    return res.status(400).send('tagname is not present');
  }

  try {
    getPagesByTag(tagname.toString()).then((result) => {
      res.status(200)
         .type('application/json')
         .send(result);
    }).catch((error) => {
      throw error;
    });
  } catch (err) {
    res.status(500);
    res.send(err);
  }
};
