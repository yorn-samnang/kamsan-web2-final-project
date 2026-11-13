import { getRecommendations, recommendationQuestions } from '../data/recommendationQuiz.js';
import { createElement } from '../utils/dom.js';

export function initRecommendationQuiz() {
  if (document.querySelector('[data-recommendation-quiz]')) return;

  const trigger = createElement('button', {
    className: 'recommendation-quiz-trigger',
    text: '?',
    dataset: { recommendationQuizTrigger: '' },
    attributes: {
      type: 'button',
      'aria-label': 'Get personalized travel recommendations',
      'aria-expanded': 'false',
      'aria-controls': 'recommendation-quiz',
    },
  });
  const panel = createElement('section', {
    className: 'recommendation-quiz-panel',
    dataset: { recommendationQuiz: '' },
    attributes: {
      id: 'recommendation-quiz',
      role: 'dialog',
      'aria-labelledby': 'recommendation-quiz-title',
      'aria-live': 'polite',
    },
  });
  panel.hidden = true;
  document.body.append(trigger, panel);

  const answers = {};
  let step = 0;
  let hasResults = false;

  function closePanel() {
    panel.hidden = true;
    trigger.setAttribute('aria-expanded', 'false');
    trigger.focus();
  }

  function renderHeader(title = 'Find your Cambodia fit') {
    const header = createElement('div', { className: 'recommendation-quiz-header' });
    header.append(
      createElement('h2', {
        attributes: { id: 'recommendation-quiz-title' },
        text: title,
      })
    );
    const closeButton = createElement('button', {
      className: 'recommendation-quiz-close',
      text: 'Close',
      attributes: { type: 'button', 'aria-label': 'Close recommendations' },
    });
    closeButton.addEventListener('click', closePanel);
    header.append(closeButton);
    return header;
  }

  function renderQuestion() {
    const question = recommendationQuestions[step];
    panel.replaceChildren(renderHeader());
    panel.append(
      createElement('p', {
        className: 'recommendation-quiz-intro',
        text: `Question ${step + 1} of ${recommendationQuestions.length} - Based on this site's destination, food, and activity guides.`,
      })
    );

    const prompt = createElement('h3', {
      className: 'recommendation-quiz-prompt',
      text: question.prompt,
      attributes: { tabindex: '-1' },
    });
    panel.append(prompt);

    const nextButton = createElement('button', {
      className: 'recommendation-quiz-next',
      text: step === recommendationQuestions.length - 1 ? 'See recommendations' : 'Next',
      attributes: { type: 'button' },
    });
    nextButton.disabled = !answers[question.id];
    nextButton.addEventListener('click', () => {
      if (!answers[question.id]) return;
      if (step < recommendationQuestions.length - 1) {
        step += 1;
        renderQuestion();
        panel.querySelector('.recommendation-quiz-prompt').focus();
        return;
      }
      renderResults();
      panel.querySelector('.recommendation-quiz-results-title').focus();
    });

    const choices = createElement('div', {
      className: 'recommendation-quiz-choices',
      attributes: { role: 'group', 'aria-label': question.prompt },
    });
    question.options.forEach((option) => {
      const choice = createElement('button', {
        className: 'recommendation-quiz-choice',
        text: option.label,
        attributes: {
          type: 'button',
          'aria-pressed': String(answers[question.id] === option.value),
        },
      });
      if (answers[question.id] === option.value) choice.classList.add('selected');
      choice.addEventListener('click', () => {
        answers[question.id] = option.value;
        choices.querySelectorAll('.recommendation-quiz-choice').forEach((button) => {
          const isSelected = button === choice;
          button.classList.toggle('selected', isSelected);
          button.setAttribute('aria-pressed', String(isSelected));
        });
        nextButton.disabled = false;
      });
      choices.append(choice);
    });
    panel.append(choices);

    const footer = createElement('div', { className: 'recommendation-quiz-actions' });
    if (step > 0) {
      const backButton = createElement('button', {
        className: 'recommendation-quiz-secondary',
        text: 'Back',
        attributes: { type: 'button' },
      });
      backButton.addEventListener('click', () => {
        step -= 1;
        renderQuestion();
        panel.querySelector('.recommendation-quiz-prompt').focus();
      });
      footer.append(backButton);
    }
    footer.append(nextButton);
    panel.append(footer);
  }

  function renderResultSection(title, items) {
    const section = createElement('section', { className: 'recommendation-quiz-result-section' });
    section.append(createElement('h4', { text: title }));
    const list = createElement('ul', { className: 'recommendation-quiz-result-list' });
    items.forEach((item) => {
      const link = createElement('a', {
        className: 'recommendation-quiz-result',
        attributes: { href: item.href },
      });
      link.append(
        createElement('img', {
          attributes: { src: item.image, alt: '', loading: 'lazy' },
        }),
        createElement('span', { text: item.name })
      );
      const listItem = createElement('li');
      listItem.append(link);
      list.append(listItem);
    });
    section.append(list);
    return section;
  }

  function renderResults() {
    const results = getRecommendations(answers);
    panel.replaceChildren(renderHeader('Your Cambodia recommendations'));
    panel.append(
      createElement('p', {
        className: 'recommendation-quiz-intro',
        text: 'These picks come from the destinations, food, and Things to Do featured on this site.',
      }),
      createElement('h3', {
        className: 'recommendation-quiz-results-title',
        text: 'Places, food, and activities to explore',
        attributes: { tabindex: '-1' },
      }),
      renderResultSection('Destinations', results.destinations),
      renderResultSection('Things to do', results.activities),
      renderResultSection('Food to try', results.foods)
    );
    const footer = createElement('div', { className: 'recommendation-quiz-actions' });
    const restartButton = createElement('button', {
      className: 'recommendation-quiz-secondary',
      text: 'Start over',
      attributes: { type: 'button' },
    });
    restartButton.addEventListener('click', () => {
      Object.keys(answers).forEach((key) => delete answers[key]);
      step = 0;
      hasResults = false;
      renderQuestion();
      panel.querySelector('.recommendation-quiz-prompt').focus();
    });
    footer.append(restartButton);
    panel.append(footer);
    hasResults = true;
  }

  trigger.addEventListener('click', () => {
    const isOpening = panel.hidden;
    panel.hidden = !isOpening;
    trigger.setAttribute('aria-expanded', String(isOpening));
    if (isOpening) {
      if (hasResults) {
        renderResults();
      } else {
        renderQuestion();
      }
      panel.querySelector('button').focus();
    }
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && !panel.hidden) closePanel();
  });
}
