import referral_levelHelper from "../helpers/referral_level.helper";
import referral_transactionHelper from "../helpers/referral_transaction.helper";
import userHelper from "../helpers/user.helper";

export async function distributeReferralBonus(paidUserId, referrerId) {
  try {
    let filters = {};
    filters.query = { referralCode: referrerId };
    let referrer = await userHelper.getObjectByQuery(filters);

    // Fetch all referral levels and sort by level
    let bonusLevels = await referral_levelHelper.getAllObjects({ query: {} });
    bonusLevels.sort((a, b) => a.level - b.level);

    // Process up to 5 levels
    for (let level = 0; level < 5; level++) {
      if (!referrer) break;

      const bonusAmount = bonusLevels[level]
        ? bonusLevels[level].bonusAmount
        : 0;

      // Update referrer's wallet earnings
      const updatedEarnings = referrer.referralEarnings + bonusAmount;
      await userHelper.directUpdateObject(referrer._id, {
        referralEarnings: updatedEarnings,
      });

      // Log the referral transaction
      await referral_transactionHelper.addObject({
        receiverId: referrer._id,
        referredUserId: paidUserId,
        level: level + 1,
        amount: bonusAmount,
      });

      // Move up the referral chain
      if (referrer.referrerId) {
        referrer = await userHelper.getObjectByQuery({
          query: { referralCode: referrer.referrerId },
        });
      } else {
        break;
      }
    }
  } catch (error) {
    console.log("Error in distributeReferralBonus:", error);
    throw error;
  }
}
