(function () {
    const sessionKey = "geoplay.supabase.session";
    const rows = document.getElementById("leaderboard-rows");
    const status = document.getElementById("leaderboard-status");
    const supabase = window.geoplaySupabase;

    function createCell(row, className, text) {
        const cell = document.createElement("td");
        if (className) cell.className = className;
        cell.textContent = text;
        row.appendChild(cell);
    }

    function renderLeaderboard(players) {
        if (!rows) return;
        rows.replaceChildren();
        players.forEach(function (player, index) {
            const row = document.createElement("tr");
            if (index < 3) row.classList.add(`leaderboard-top-${index + 1}`);
            createCell(row, "leaderboard-rank", String(index + 1).padStart(2, "0"));
            createCell(row, "leaderboard-username", player.username);
            createCell(row, "leaderboard-level", `⭐ ${Math.floor(player.xp / 100) + 1} · ${player.xp} XP`);
            rows.appendChild(row);
        });
    }

    async function loadLeaderboard() {
        if (!rows || !status) return;
        try {
            const players = await supabase.dataRequest(
                "leaderboard_scores?select=username,xp&order=xp.desc,updated_at.asc&limit=10"
            );
            renderLeaderboard(players);
            status.textContent = players.length
                ? "Cấp độ được tính từ tổng XP của người chơi."
                : "Chưa có người chơi trên bảng xếp hạng. Hãy đăng nhập và bắt đầu chơi!";
            status.hidden = Boolean(players.length);
        } catch (error) {
            console.error("Không thể tải bảng xếp hạng:", error);
            status.hidden = false;
            status.textContent = "Chưa thể tải bảng xếp hạng. Hãy kiểm tra cấu hình Supabase và chạy supabase-leaderboard.sql.";
        }
    }

    async function syncLeaderboardScore() {
        const session = await supabase.getValidSession();
        if (!session) return;

        const user = await supabase.authRequest("user", {
            accessToken: session.access_token
        });
        if (!user || !user.id) {
            throw new Error("Không thể xác định tài khoản Supabase đang đăng nhập.");
        }

        const ownScores = await supabase.dataRequest(
            `leaderboard_scores?select=xp&user_id=eq.${encodeURIComponent(user.id)}&limit=1`,
            { session: session }
        );
        const localXP = Math.max(0, Math.floor(Number(localStorage.getItem("xp")) || 0));
        const remoteXP = ownScores.length ? Math.max(0, Number(ownScores[0].xp) || 0) : 0;
        const xp = Math.max(localXP, remoteXP);
        const metadataUsername = user.user_metadata && user.user_metadata.username;
        const emailUsername = user.email ? user.email.split("@")[0] : "";
        const username = (typeof metadataUsername === "string" && metadataUsername.trim()
            ? metadataUsername
            : emailUsername || "Học viên").trim().slice(0, 32);

        await supabase.dataRequest("leaderboard_scores?on_conflict=user_id", {
            method: "POST",
            session: session,
            body: {
                user_id: user.id,
                username: username,
                xp: xp,
                updated_at: new Date().toISOString()
            }
        });

        if (xp !== localXP) {
            localStorage.setItem("xp", String(xp));
            window.dispatchEvent(new Event("accountstatschange"));
        }
        await loadLeaderboard();
    }

    function syncAfterScoreChange() {
        syncLeaderboardScore().catch(function (error) {
            console.error("Không thể đồng bộ điểm xếp hạng:", error);
            if (status) {
                status.hidden = false;
                status.textContent = "Không thể đồng bộ cấp độ. Hãy thử lại sau.";
            }
        });
    }

    window.syncLeaderboardScore = syncLeaderboardScore;
    window.addEventListener("accountstatschange", syncAfterScoreChange);
    window.addEventListener("authsessionchange", syncAfterScoreChange);
    window.addEventListener("storage", function (event) {
        if (event.key === "xp" || event.key === sessionKey) syncAfterScoreChange();
    });

    loadLeaderboard();
    if (!document.getElementById("account-profile")) syncAfterScoreChange();
})();
