(function () {
    const balanceKey = "geoCoins";
    const activityHistoryKey = "geoCoins.rewardedActivities";
    const legacyQuizHistoryKey = "geoCoins.rewardedQuizzes";
    const completionReward = 10;

    function readRewardHistory(key) {
        const stored = localStorage.getItem(key);
        if (stored === null) return [];

        let history;
        try {
            history = JSON.parse(stored);
        } catch (error) {
            throw new Error("Danh sách phần thưởng đã lưu không hợp lệ.");
        }
        if (!Array.isArray(history) ||
            history.some(function (id) { return typeof id !== "string"; })) {
            throw new Error("Danh sách phần thưởng đã lưu không hợp lệ.");
        }
        return history;
    }

    function readBalance() {
        const stored = localStorage.getItem(balanceKey);
        const balance = stored === null ? 0 : Number(stored);
        if (!Number.isSafeInteger(balance) || balance < 0) {
            throw new Error("Số dư Geo Coin hiện tại không hợp lệ.");
        }
        return balance;
    }

    function award(activityId) {
        if (typeof activityId !== "string" || !activityId.trim()) {
            throw new Error("Mã hoạt động nhận thưởng không hợp lệ.");
        }

        const activities = readRewardHistory(activityHistoryKey);
        const legacyQuizActivities = readRewardHistory(legacyQuizHistoryKey)
            .map(function (quizId) { return "quiz:" + quizId; });
        const rewardedActivities = Array.from(new Set(activities.concat(legacyQuizActivities)));
        const balance = readBalance();
        if (rewardedActivities.includes(activityId)) {
            return { awarded: false, amount: 0, balance: balance };
        }
        if (!Number.isSafeInteger(balance + completionReward)) {
            throw new Error("Số dư Geo Coin đã vượt giới hạn.");
        }

        const previousHistory = localStorage.getItem(activityHistoryKey);
        localStorage.setItem(activityHistoryKey, JSON.stringify(rewardedActivities.concat(activityId)));
        try {
            localStorage.setItem(balanceKey, String(balance + completionReward));
        } catch (error) {
            try {
                if (previousHistory === null) {
                    localStorage.removeItem(activityHistoryKey);
                } else {
                    localStorage.setItem(activityHistoryKey, previousHistory);
                }
            } catch (rollbackError) {
                console.error("Không thể khôi phục danh sách phần thưởng:", rollbackError);
            }
            throw error;
        }

        window.dispatchEvent(new Event("accountstatschange"));
        return { awarded: true, amount: completionReward, balance: balance + completionReward };
    }

    function announceCompletion(activityId, element, activityLabel) {
        if (!element) {
            throw new Error("Không tìm thấy vị trí hiển thị phần thưởng Geo Coin.");
        }

        const label = activityLabel || "hoạt động này";
        try {
            const result = award(activityId);
            element.textContent = result.awarded
                ? "Bạn nhận được " + result.amount + " Geo Coin cho lần hoàn thành đầu tiên của " + label + "."
                : "Bạn đã nhận phần thưởng Geo Coin cho " + label + " trước đó.";
            return result;
        } catch (error) {
            console.error("Không thể lưu phần thưởng Geo Coin:", error);
            element.textContent = "Không thể lưu phần thưởng Geo Coin: " + error.message;
            return null;
        }
    }

    window.geoplayGeoCoinRewards = Object.freeze({
        award: award,
        announceCompletion: announceCompletion
    });
})();
