import { Promise } from 'rsvp';

export default function waitFor(predicate, timeout, messageParser) {
  return new Promise((resolve, reject) => {
    const pollingInt = 10;
    let timeLeft = timeout;

    const i = setInterval(() => {
      if (timeLeft < 0) {
        clearInterval(i);
        reject(new Error(messageParser()));
      }

      if (predicate()) {
        clearInterval(i);
        resolve(true);
      }

      timeLeft -= pollingInt;
    }, pollingInt);
  });
}

export function waitForElement(selector, timeout) {
  return waitFor(
    () => !!document.querySelector(selector),
    timeout,
    () => `Cound not find DOM Element "${selector}" within ${timeout}ms`,
  );
}
