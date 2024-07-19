import { Sessions } from "../entity/sessions";
import { UserSessions } from "../entity/user_sessions";
import { getRepository } from "../repository";

export const getUserSession = async (token: string) => {
  if (!token) {
    return null;
  }

  const session = await getRepository(UserSessions).findOne({
    where: {
      sessionId: token,
    },
  });

  if (!session) {
    return null;
  }
  return session;
}


export function parseAuthUserSeqNum(value: any) {
  let seq: number = 0;
  switch (typeof value) {
    case 'number': {
      seq = value;
      break;
    }
    case 'string': {
      const result = value.match(/^([\d{0, 10}])$/);
      if (result?.[1]) {
        seq = Number(result[1]);
      }
      break;
    }

    default: {
      seq = 0;
    }
  }

  return Math.max(0, seq);
}