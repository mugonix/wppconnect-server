/*
 * Copyright 2021 WPPConnect Team
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

export default async function statusConnection(req, res, next) {
  try {
    if (req.client && req.client.isConnected) {
      await req.client.isConnected();

      let localArr = [];
      const number = req.body.phone || [];
      const isGroup = req.body.isGroup;
      if (Array.isArray(number)) {
        for (const contact of number) {
          if (contact !== '')
            if (isGroup) localArr.push(`${contact}@g.us`);
            else localArr.push(`${contact}@c.us`);
        }
      } else {
        let arrContacts = number.split(/\s*[,;]\s*/g);
        for (let contact of arrContacts) {
          contact = contact.split('@')[0];
          if (contact !== '')
            if (isGroup) localArr.push(`${contact}@g.us`);
            else localArr.push(`${contact}@c.us`);
        }
      }

      let index = 0;
      for (const contact of localArr) {
        if (numbers.indexOf(contact) < 0) {
          let profile = await req.client.checkNumberStatus(contact).catch((error) => console.log(error));
          if (!profile.numberExists) {
            const num = contact.split('@')[0];
            return res.status(400).json({
              response: null,
              status: 'Connected',
              message: `O número ${num} não existe.`,
            });
          } else {
            if (numbers.indexOf(profile.id._serialized) < 0) {
              numbers.push(profile.id._serialized);
            }
            localArr[index] = profile.id._serialized;
          }
        }
        index++;
      }
      req.body.phone = localArr;
    } else {
      return res.status(404).json({
        response: null,
        status: 'Disconnected',
        message: 'A sessão do WhatsApp não está ativa.',
      });
    }
    next();
  } catch (error) {
    req.logger.error(error);
    return res.status(404).json({
      response: null,
      status: 'Disconnected',
      message: 'A sessão do WhatsApp não está ativa.',
    });
  }
}
let numbers = [];
