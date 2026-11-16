(function () {
    const elements = {
        title: document.getElementById("quiz-title"),
        description: document.getElementById("quiz-description"),
        unavailable: document.getElementById("quiz-unavailable"),
        form: document.getElementById("quiz-form"),
        questions: document.getElementById("quiz-questions"),
        result: document.getElementById("quiz-result"),
        score: document.getElementById("quiz-score"),
        feedback: document.getElementById("quiz-feedback"),
        reward: document.getElementById("quiz-reward"),
        retry: document.getElementById("retry-quiz")
    };

    const topicId = new URLSearchParams(window.location.search).get("bai");
    const quiz = window.grade12QuizData && window.grade12QuizData[topicId];
    if (!quiz) {
        elements.unavailable.hidden = false;
        return;
    }

    const displayTitles = {
        "bai-1": "Vị trí địa lí và phạm vi lãnh thổ",
        "bai-2": "Thiên nhiên nhiệt đới ẩm gió mùa",
        "bai-3": "Sự phân hóa đa dạng của thiên nhiên",
        "bai-5": "Sử dụng hợp lí tài nguyên thiên nhiên và bảo vệ môi trường",
        "bai-7": "Dân số Việt Nam",
        "bai-8": "Lao động và việc làm",
        "bai-9": "Đô thị hóa",
        "bai-12": "Vấn đề phát triển ngành nông nghiệp"
    };
    elements.title.textContent = displayTitles[topicId] || quiz.title;
    const trueFalseCount = quiz.trueFalse.reduce(function (count, group) {
        return count + group.statements.length;
    }, 0);
    const sections = [
        quiz.multipleChoice.length + " câu trắc nghiệm",
        trueFalseCount + " nhận định đúng - sai"
    ];
    if (quiz.shortAnswer && quiz.shortAnswer.length) {
        sections.push(quiz.shortAnswer.length + " câu trả lời ngắn");
    }
    elements.description.textContent = "Đề gồm " + sections.join(", ") + ".";
    document.title = "Bài kiểm tra: " + elements.title.textContent;

    const answers = [];

    function createElement(tagName, className, text) {
        const element = document.createElement(tagName);
        if (className) element.className = className;
        if (text !== undefined) element.textContent = text;
        return element;
    }

    function addQuestion(parent, legendText, name, options, correctValue, correctText) {
        const fieldset = createElement("fieldset", "quiz-question");
        fieldset.appendChild(createElement("legend", "", legendText));

        options.forEach(function (option, index) {
            const label = createElement("label", "quiz-option");
            const input = document.createElement("input");
            input.type = "radio";
            input.name = name;
            input.value = option.value;
            input.required = index === 0;
            label.appendChild(input);
            label.appendChild(createElement("span", "", option.label));
            fieldset.appendChild(label);
        });

        parent.appendChild(fieldset);
        answers.push({
            name: name,
            correctValue: String(correctValue),
            correctText: correctText,
            fieldset: fieldset
        });
    }

    const multipleChoiceSection = createElement("section", "quiz-topic");
    multipleChoiceSection.appendChild(createElement("h2", "", "I. Trắc nghiệm nhiều lựa chọn"));
    quiz.multipleChoice.forEach(function (question, index) {
        const options = question.options.map(function (option, optionIndex) {
            return {
                value: String(optionIndex),
                label: String.fromCharCode(65 + optionIndex) + ". " + option
            };
        });
        const correctText = String.fromCharCode(65 + question.answer) + ". " + question.options[question.answer];
        addQuestion(
            multipleChoiceSection,
            "Câu " + (index + 1) + ": " + question.question,
            "multiple-choice-" + index,
            options,
            question.answer,
            correctText
        );
    });
    elements.questions.appendChild(multipleChoiceSection);

    const trueFalseSection = createElement("section", "quiz-topic");
    trueFalseSection.appendChild(createElement("h2", "", "II. Trắc nghiệm đúng - sai"));
    quiz.trueFalse.forEach(function (group, groupIndex) {
        const groupElement = createElement("div", "quiz-context-group");
        groupElement.appendChild(createElement("p", "quiz-context", group.context));
        group.statements.forEach(function (statement, statementIndex) {
            const subQuestion = String.fromCharCode(97 + statementIndex);
            const correctText = statement.answer ? "Đúng" : "Sai";
            addQuestion(
                groupElement,
                "Câu " + (groupIndex + 1) + subQuestion + ") " + statement.text,
                "true-false-" + groupIndex + "-" + statementIndex,
                [
                    { value: "true", label: "Đúng" },
                    { value: "false", label: "Sai" }
                ],
                statement.answer,
                correctText
            );
        });
        trueFalseSection.appendChild(groupElement);
    });
    elements.questions.appendChild(trueFalseSection);

    if (quiz.shortAnswer && quiz.shortAnswer.length) {
        const shortAnswerSection = createElement("section", "quiz-topic");
        shortAnswerSection.appendChild(createElement("h2", "", "III. Trả lời ngắn"));
        quiz.shortAnswer.forEach(function (question, index) {
            const fieldset = createElement("fieldset", "quiz-question");
            fieldset.appendChild(createElement(
                "legend",
                "",
                "Câu " + (index + 1) + ": " + question.question
            ));

            const label = createElement("label", "quiz-short-answer-label", "Nhập đáp án");
            const input = document.createElement("input");
            input.className = "quiz-short-answer-input";
            input.type = "text";
            input.inputMode = "decimal";
            input.name = "short-answer-" + index;
            input.required = true;
            label.appendChild(input);
            fieldset.appendChild(label);
            shortAnswerSection.appendChild(fieldset);
            answers.push({
                name: input.name,
                type: "number",
                correctValue: question.answer,
                correctText: question.answer,
                fieldset: fieldset
            });
        });
        elements.questions.appendChild(shortAnswerSection);
    }
    elements.form.hidden = false;

    elements.form.addEventListener("submit", function (event) {
        event.preventDefault();
        const formData = new FormData(elements.form);
        let correctCount = 0;

        answers.forEach(function (answer) {
            const submittedValue = formData.get(answer.name);
            const isCorrect = answer.type === "number"
                ? parseNumericAnswer(submittedValue) === parseNumericAnswer(answer.correctValue)
                : submittedValue === answer.correctValue;
            if (isCorrect) {
                correctCount += 1;
                answer.fieldset.classList.add("is-correct");
            } else {
                answer.fieldset.classList.add("is-incorrect");
            }

            const feedback = createElement(
                "p",
                "quiz-answer-feedback",
                "Đáp án đúng: " + answer.correctText
            );
            answer.fieldset.appendChild(feedback);
        });

        const percentage = Math.round((correctCount / answers.length) * 100);
        elements.score.textContent = "Bạn trả lời đúng " + correctCount + "/" + answers.length + " câu (" + percentage + "%).";
        elements.feedback.textContent = correctCount === answers.length
            ? "Xuất sắc! Bạn đã trả lời đúng tất cả câu hỏi."
            : "Hãy xem lại đáp án đúng bên dưới mỗi câu để ôn tập thêm.";
        window.geoplayGeoCoinRewards.announceCompletion(
            "quiz:" + topicId,
            elements.reward,
            "đề này"
        );
        elements.form.hidden = true;
        elements.result.hidden = false;
        elements.result.scrollIntoView({ behavior: "smooth", block: "start" });
    });

    elements.retry.addEventListener("click", function () {
        window.location.reload();
    });

    function parseNumericAnswer(value) {
        const normalized = String(value).trim().replace(/\s/g, "").replace(",", ".");
        if (!/^[+-]?(?:\d+\.?\d*|\.\d+)$/.test(normalized)) {
            return null;
        }
        const number = Number(normalized);
        return Number.isFinite(number) ? number : null;
    }
})();
