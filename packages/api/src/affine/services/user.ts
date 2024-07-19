import { getRepository as getAffineRepository } from "../repository"
import { getRepository as getOmnivoreRepository } from "../../repository"
import { Users } from "../entity/users"
import { getUserSession } from "./sessions";
import { User } from "../../entity/user";
import { createUserInternal } from "../../services/create_user_internal";

export const getUser = async (
  token: string,
) => {
  const affineSession = await getUserSession(token);

  // no such session
  if (!affineSession) {
    return { user: null, expiresAt: null };
  }

  const affineUser = await getAffineRepository(Users).findOne({
    where: {
      id: affineSession?.userId,
    }
  });

  if (!affineUser) {
    return { user: null, expiresAt: null };
  }


  const omnivoreUser = await getOmnivoreRepository(User).findOne({
    where: {
      id: affineUser.id,
    }
  });
  if(!omnivoreUser){
    await createUserInternal({
      userId: affineUser.id,
      provider: "EMAIL",
      email: affineUser.email,
      username: affineUser.name,
      name: affineUser.name,
      pictureUrl: affineUser.avatarUrl || undefined,
      pendingConfirmation: false
    })
  }


  return { user: affineUser, expiresAt: affineSession.expiresAt };
}