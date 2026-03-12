const STAGE_ON_STORAGE_KEY = "stageon-liked-shows";
const STAGE_ON_DATA_URL = "data/performance-data.json";

async function loadStageOnData() {
    try {
        const response = await fetch(STAGE_ON_DATA_URL);
        if (!response.ok) {
            throw new Error("공연 데이터를 불러오지 못했습니다.");
        }
        return await response.json();
    } catch (error) {
        return window.STAGE_ON_FALLBACK || {
            brand: {
                name: "STAGE ON",
                tagline: "도심 한가운데서 터지는 리듬, 몸으로 기억되는 퍼포먼스",
                description: "정적 환경 기본 데이터"
            },
            shows: [],
            reviews: [],
            booking: {
                dates: [],
                times: [],
                seatRows: [],
                seatColumns: 0,
                discountOptions: [],
                couponOptions: [],
                paymentMethods: []
            }
        };
    }
}

function formatCurrency(value) {
    return new Intl.NumberFormat("ko-KR").format(value) + "원";
}

function getLikedShows() {
    try {
        const raw = localStorage.getItem(STAGE_ON_STORAGE_KEY);
        return raw ? JSON.parse(raw) : [];
    } catch (error) {
        return [];
    }
}

function setLikedShows(items) {
    localStorage.setItem(STAGE_ON_STORAGE_KEY, JSON.stringify(items));
}

function toggleLikedShow(showId) {
    const current = getLikedShows();
    const next = current.includes(showId) ? current.filter((id) => id !== showId) : [...current, showId];
    setLikedShows(next);
    return next;
}

function createStars(rating) {
    return "★".repeat(rating) + "☆".repeat(5 - rating);
}

function bindWishlistButtons(root, showId) {
    const buttons = root.querySelectorAll(`[data-like-id="${showId}"]`);
    const liked = getLikedShows().includes(showId);
    buttons.forEach((button) => {
        button.textContent = liked ? "찜 완료" : "찜하기";
        button.addEventListener("click", () => {
            const next = toggleLikedShow(showId);
            const isLiked = next.includes(showId);
            buttons.forEach((item) => {
                item.textContent = isLiked ? "찜 완료" : "찜하기";
            });
        });
    });
}

function renderShowCards(container, shows) {
    if (!container) {
        return;
    }

    container.innerHTML = shows.map((show) => `
        <article class="show-card">
            <div class="show-poster" data-tone="${show.posterTone}">
                <div class="show-poster-copy">
                    <span class="tone-badge">${show.posterLabel}</span>
                    <h3 class="show-title">${show.title}</h3>
                    <p>${show.subtitle}</p>
                </div>
            </div>
            <div class="inline-meta">
                <span class="pill-stat">평점 ${show.rating}</span>
                <span class="pill-stat">찜 ${show.likeCount}</span>
                <span class="pill-stat">${formatCurrency(show.price)}</span>
            </div>
            <p>${show.description}</p>
            <div class="show-meta">
                <span>기간 ${show.period}</span>
                <span>장소 ${show.venue}</span>
            </div>
            <div class="tag-row">
                ${show.genres.map((genre) => `<span class="tag">${genre}</span>`).join("")}
            </div>
            <div class="card-actions">
                <a class="stageon-btn" href="detail.html">상세 보기</a>
                <button type="button" class="stageon-ghost-btn" data-like-id="${show.id}">찜하기</button>
            </div>
        </article>
    `).join("");

    shows.forEach((show) => bindWishlistButtons(container, show.id));
}

function renderReviews(container, reviews) {
    if (!container) {
        return;
    }

    container.innerHTML = reviews.map((review) => `
        <article class="review-card">
            <div class="review-head">
                <div>
                    <h3>${review.title}</h3>
                    <div class="muted">${review.author} · ${review.date}</div>
                </div>
                <div class="stars" aria-label="별점 ${review.rating}점">${createStars(review.rating)}</div>
            </div>
            <p>${review.body}</p>
        </article>
    `).join("");
}

function setupTabs() {
    document.querySelectorAll("[data-tab-group]").forEach((group) => {
        const buttons = group.querySelectorAll("[data-tab-target]");
        const panels = group.parentElement.querySelectorAll("[data-tab-panel]");
        buttons.forEach((button) => {
            button.addEventListener("click", () => {
                const target = button.dataset.tabTarget;
                buttons.forEach((item) => item.classList.toggle("active", item === button));
                panels.forEach((panel) => panel.classList.toggle("active", panel.dataset.tabPanel === target));
            });
        });
    });
}

function setupAuthForms() {
    document.querySelectorAll("[data-auth-form]").forEach((form) => {
        const errorBox = form.querySelector("[data-form-error]");
        form.addEventListener("submit", (event) => {
            event.preventDefault();
            const invalidField = [...form.querySelectorAll("[data-required]")].find((field) => !field.value.trim());
            if (invalidField) {
                errorBox.textContent = "필수 입력 항목을 확인해 주세요.";
                invalidField.focus();
                return;
            }
            const password = form.querySelector("[name='password']");
            const passwordConfirm = form.querySelector("[name='passwordConfirm']");
            if (password && passwordConfirm && password.value !== passwordConfirm.value) {
                errorBox.textContent = "비밀번호와 비밀번호 확인이 일치하지 않습니다.";
                passwordConfirm.focus();
                return;
            }
            errorBox.textContent = "정적 목업 화면입니다. 실제 전송은 발생하지 않습니다.";
        });
    });
}

function buildSeatButtons(booking) {
    const container = document.querySelector("[data-seat-grid]");
    if (!container) {
        return;
    }
    const occupied = new Set(["A3", "B5", "C2", "D7"]);
    const seats = [];
    booking.seatRows.forEach((row) => {
        for (let column = 1; column <= booking.seatColumns; column += 1) {
            const seat = `${row}${column}`;
            seats.push(`<button type="button" class="seat-btn ${occupied.has(seat) ? "disabled" : ""}" data-seat="${seat}">${seat}</button>`);
        }
    });
    container.innerHTML = seats.join("");
}

function fillBookingOptions(data) {
    const dateGrid = document.querySelector("[data-date-grid]");
    const timeGrid = document.querySelector("[data-time-grid]");
    const discountRoot = document.querySelector("[data-discount-options]");
    const couponRoot = document.querySelector("[data-coupon-list]");
    const paymentRoot = document.querySelector("[data-payment-methods]");

    if (dateGrid) {
        dateGrid.innerHTML = data.booking.dates.map((date, index) => `<button type="button" class="choice-btn ${index === 0 ? "active" : ""}" data-date="${date}">${date}</button>`).join("");
    }
    if (timeGrid) {
        timeGrid.innerHTML = data.booking.times.map((time, index) => `<button type="button" class="choice-btn ${index === 0 ? "active" : ""}" data-time="${time}">${time}</button>`).join("");
    }
    if (discountRoot) {
        discountRoot.innerHTML = data.booking.discountOptions.map((option, index) => `
            <label class="stageon-radio">
                <input type="radio" name="discount" value="${option.id}" ${index === 0 ? "checked" : ""}>
                <span><strong>${option.name}</strong><br><span class="muted">${option.desc}</span></span>
            </label>
        `).join("");
    }
    if (couponRoot) {
        couponRoot.innerHTML = data.booking.couponOptions.map((coupon, index) => `<button type="button" class="choice-btn ${index === 0 ? "active" : ""}" data-coupon-code="${coupon.code}">${coupon.label}</button>`).join("");
    }
    if (paymentRoot) {
        paymentRoot.innerHTML = data.booking.paymentMethods.map((method, index) => `
            <label class="method-option">
                <input type="radio" name="payment" value="${method}" ${index === 0 ? "checked" : ""}>
                <span>${method}</span>
            </label>
        `).join("");
    }
}

function setupBooking(data, show) {
    const bookingRoot = document.querySelector("[data-booking-root]");
    if (!bookingRoot) {
        return;
    }

    const state = {
        step: 0,
        date: data.booking.dates[0] || "",
        time: data.booking.times[0] || "",
        seats: [],
        people: 2,
        discount: data.booking.discountOptions[0]?.id || "normal",
        point: 0,
        coupon: data.booking.couponOptions[0]?.code || "",
        payment: data.booking.paymentMethods[0] || "신용카드"
    };

    const stepChips = [...bookingRoot.querySelectorAll(".step-chip")];
    const panels = [...bookingRoot.querySelectorAll(".step-panel")];
    const summary = bookingRoot.querySelector("[data-booking-summary]");

    function discountedPrice() {
        const base = show.price * state.people;
        const rates = { normal: 0, youth: 0.15, special: 0.3 };
        const afterDiscount = Math.round(base * (1 - (rates[state.discount] || 0)));
        const afterPoints = Math.max(afterDiscount - state.point, 0);
        return Math.max(afterPoints - (state.coupon ? 5000 : 0), 0);
    }

    function renderSummary() {
        const selectedDiscount = data.booking.discountOptions.find((option) => option.id === state.discount)?.name || "일반";
        summary.innerHTML = `
            <ul class="summary-list">
                <li><span>공연</span><strong>${show.title}</strong></li>
                <li><span>관람 일시</span><strong>${state.date} ${state.time}</strong></li>
                <li><span>좌석</span><strong>${state.seats.join(", ") || "미선택"}</strong></li>
                <li><span>인원</span><strong>${state.people}명</strong></li>
                <li><span>할인</span><strong>${selectedDiscount}</strong></li>
                <li><span>쿠폰</span><strong>${state.coupon || "미적용"}</strong></li>
                <li><span>포인트</span><strong>${state.point.toLocaleString("ko-KR")}P</strong></li>
            </ul>
            <div class="summary-total">
                <span>예상 결제 금액</span>
                <strong>${formatCurrency(discountedPrice())}</strong>
            </div>
        `;
    }

    function updateStepView() {
        stepChips.forEach((chip, index) => chip.classList.toggle("active", index === state.step));
        panels.forEach((panel, index) => panel.classList.toggle("active", index === state.step));
        renderSummary();
    }

    bookingRoot.querySelectorAll("[data-step-next]").forEach((button) => {
        button.addEventListener("click", () => {
            state.step = Math.min(state.step + 1, panels.length - 1);
            updateStepView();
        });
    });

    bookingRoot.querySelectorAll("[data-step-prev]").forEach((button) => {
        button.addEventListener("click", () => {
            state.step = Math.max(state.step - 1, 0);
            updateStepView();
        });
    });

    bookingRoot.querySelectorAll("[data-date]").forEach((button) => {
        button.addEventListener("click", () => {
            state.date = button.dataset.date;
            bookingRoot.querySelectorAll("[data-date]").forEach((item) => item.classList.toggle("active", item === button));
            renderSummary();
        });
    });

    bookingRoot.querySelectorAll("[data-time]").forEach((button) => {
        button.addEventListener("click", () => {
            state.time = button.dataset.time;
            bookingRoot.querySelectorAll("[data-time]").forEach((item) => item.classList.toggle("active", item === button));
            renderSummary();
        });
    });

    bookingRoot.querySelectorAll("[data-seat]").forEach((button) => {
        if (button.classList.contains("disabled")) {
            return;
        }
        button.addEventListener("click", () => {
            const seat = button.dataset.seat;
            if (state.seats.includes(seat)) {
                state.seats = state.seats.filter((item) => item !== seat);
            } else if (state.seats.length < state.people) {
                state.seats = [...state.seats, seat];
            }
            bookingRoot.querySelectorAll("[data-seat]").forEach((item) => item.classList.toggle("active", state.seats.includes(item.dataset.seat)));
            renderSummary();
        });
    });

    const peopleInput = bookingRoot.querySelector("[name='people']");
    if (peopleInput) {
        peopleInput.addEventListener("change", () => {
            state.people = Number(peopleInput.value) || 1;
            state.seats = state.seats.slice(0, state.people);
            renderSummary();
        });
    }

    bookingRoot.querySelectorAll("[name='discount']").forEach((input) => {
        input.addEventListener("change", () => {
            state.discount = input.value;
            renderSummary();
        });
    });

    const pointInput = bookingRoot.querySelector("[name='point']");
    if (pointInput) {
        pointInput.addEventListener("input", () => {
            state.point = Number(pointInput.value) || 0;
            renderSummary();
        });
    }

    bookingRoot.querySelectorAll("[data-coupon-code]").forEach((button) => {
        button.addEventListener("click", () => {
            state.coupon = button.dataset.couponCode;
            bookingRoot.querySelectorAll("[data-coupon-code]").forEach((item) => item.classList.toggle("active", item === button));
            renderSummary();
        });
    });

    bookingRoot.querySelectorAll("[name='payment']").forEach((input) => {
        input.addEventListener("change", () => {
            state.payment = input.value;
            renderSummary();
        });
    });

    const finishButton = bookingRoot.querySelector("[data-finish-booking]");
    if (finishButton) {
        finishButton.addEventListener("click", () => {
            window.location.href = "booking-complete.html";
        });
    }

    updateStepView();
}

function setupWishlist(data) {
    const container = document.querySelector("[data-wishlist-grid]");
    if (!container) {
        return;
    }

    const likedIds = getLikedShows();
    const likedShows = data.shows.filter((show) => likedIds.includes(show.id));
    if (!likedShows.length) {
        container.innerHTML = `
            <div class="stageon-card empty-state">
                <h2 class="section-title">아직 찜한 공연이 없습니다</h2>
                <p class="section-copy">리스트 또는 상세 페이지에서 찜하기를 누르면 이 공간에 카드가 쌓입니다.</p>
                <div class="inline-actions"><a class="stageon-btn" href="list.html">공연 리스트 보기</a></div>
            </div>
        `;
        return;
    }

    container.innerHTML = likedShows.map((show) => `
        <article class="wishlist-card">
            <div class="show-poster" data-tone="${show.posterTone}">
                <div class="show-poster-copy">
                    <span class="tone-badge">${show.posterLabel}</span>
                    <h3 class="show-title">${show.title}</h3>
                    <p>${show.subtitle}</p>
                </div>
            </div>
            <div class="show-meta">
                <span>${show.period}</span>
                <span>${show.venue}</span>
                <span>${formatCurrency(show.price)}</span>
            </div>
            <div class="card-actions">
                <button type="button" class="stageon-ghost-btn" data-like-id="${show.id}">찜 해제</button>
                <a class="stageon-btn" href="booking.html">예매하러 가기</a>
            </div>
        </article>
    `).join("");

    likedShows.forEach((show) => {
        bindWishlistButtons(container, show.id);
        container.querySelectorAll(`[data-like-id="${show.id}"]`).forEach((button) => {
            button.addEventListener("click", () => setupWishlist(data), { once: true });
        });
    });
}

function hydrateLanding(data) {
    const lead = document.querySelector("[data-brand-lead]");
    if (lead) {
        lead.textContent = data.brand.description;
    }
    const featureGrid = document.querySelector("[data-landing-feature-grid]");
    if (featureGrid) {
        const features = [
            ["공연 소개", "브랜드 무드와 대표 공연을 전면 배치해 첫 인상을 만듭니다."],
            ["상세 정보", "공연 정보, 할인, 위치, 후기를 탭 구조로 한 곳에 모았습니다."],
            ["예매 플로우", "관람일시부터 결제수단까지 7단계 예약 UX를 목업으로 재현했습니다."],
            ["인증 화면", "로그인, 비밀번호 찾기, 회원가입까지 실서비스 느낌으로 정리했습니다."],
            ["후기와 찜", "리뷰 리스트, 등록 UI, 찜 보관함으로 개인화 흐름을 보여줍니다."],
            ["정적 데이터", "JSON 더미 데이터를 기반으로 카드, 후기, 할인, 좌석 정보를 렌더링합니다."]
        ];
        featureGrid.innerHTML = features.map(([title, description]) => `
            <article class="feature-card">
                <h3>${title}</h3>
                <p>${description}</p>
            </article>
        `).join("");
    }
}

async function initStageOn() {
    const data = await loadStageOnData();
    const show = data.shows[0];
    const page = document.body.dataset.page;

    hydrateLanding(data);

    if ((page === "landing" || page === "list") && data.shows.length) {
        renderShowCards(document.querySelector("[data-show-grid]"), data.shows);
    }

    if (page === "detail" && show) {
        const reviews = data.reviews.filter((review) => show.reviewIds.includes(review.id));
        const map = {
            "[data-show-title]": show.title,
            "[data-show-subtitle]": show.heroCopy,
            "[data-show-description]": show.description
        };
        Object.entries(map).forEach(([selector, value]) => {
            const element = document.querySelector(selector);
            if (element) {
                element.textContent = value;
            }
        });
        const stats = document.querySelector("[data-show-stats]");
        if (stats) {
            stats.innerHTML = `<span class="pill-stat">평점 ${show.rating}</span><span class="pill-stat">찜 ${show.likeCount}</span><span class="pill-stat">${formatCurrency(show.price)}</span>`;
        }
        const meta = document.querySelector("[data-show-meta]");
        if (meta) {
            meta.innerHTML = `
                <div>공연 기간 <strong>${show.period}</strong></div>
                <div>공연 시간 <strong>${show.schedule.join(" / ")}</strong></div>
                <div>관람 연령 <strong>${show.age}</strong></div>
                <div>관람 시간 <strong>${show.runtime}</strong></div>
                <div>장소 안내 <strong>${show.venue}</strong></div>
            `;
        }
        const discountGrid = document.querySelector("[data-discount-grid]");
        if (discountGrid) {
            discountGrid.innerHTML = show.discounts.map((discount) => `
                <article class="discount-card">
                    <h3>${discount.name}</h3>
                    <p>대상 ${discount.target}</p>
                    <p>할인율 ${discount.rate}</p>
                    <p>유의사항 ${discount.note}</p>
                </article>
            `).join("");
        }
        const transport = document.querySelector("[data-transport-list]");
        if (transport) {
            transport.innerHTML = `
                <div><strong>주소</strong><br>${show.location}</div>
                <div><strong>지하철</strong><br>${show.transport.subway}</div>
                <div><strong>버스</strong><br>${show.transport.bus}</div>
                <div><strong>주차</strong><br>${show.transport.parking}</div>
            `;
        }
        renderReviews(document.querySelector("[data-review-grid]"), reviews);
        bindWishlistButtons(document, show.id);
    }

    if (page === "booking" && show) {
        fillBookingOptions(data);
        buildSeatButtons(data.booking);
        setupBooking(data, show);
    }

    if (page === "wishlist") {
        setupWishlist(data);
    }

    setupTabs();
    setupAuthForms();
}

document.addEventListener("DOMContentLoaded", initStageOn);


