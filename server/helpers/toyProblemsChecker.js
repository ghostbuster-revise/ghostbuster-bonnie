const githubQuery = require('./githubQuery');
const { allCohorts } = require('../config/cohorts');
const { allToyProblems } = require('../config/toyproblems');

// so node won't throw an error and crash when a student doesn't have a fork
process.on('uncaughtException', err => {
  console.log('Caught exception: ', err);
});

const getStudentsList = cohortName => {
  const studentsList = allCohorts.filter(x => x.name === cohortName);
  return studentsList && studentsList.length ? studentsList[0].students : [];
};

const checkIfPrTitleMatches = prTitle => {
  return allToyProblems.some(substring => prTitle.toLowerCase().includes(substring));
};

const AllPrsWithMatchingTitles = async studentPrList => {
  const allMatchedPrs = studentPrList.filter(e => checkIfPrTitleMatches(e.toLowerCase()));

  return allMatchedPrs;
};

const numberOfUniquePrsWithMatchingTitles = prList => {
  const allMatchedStrings = prList.map(pr => {
    const prArray = pr
      .toLowerCase()
      .replace('.js', '')
      .replace(/[^a-z ]/g, '')
      .split(' ');

    return prArray.filter(str => allToyProblems.indexOf(str) > -1);
  });

  const flattenedMatchedStrings = [];
  allMatchedStrings.forEach(item => flattenedMatchedStrings.push(...item));
  const uniqueMatchedPrsArray = Array.from(new Set(flattenedMatchedStrings));
  return uniqueMatchedPrsArray.length;
};

const getPrListForStudent = async (cohort, student) => {
  const studentName = `${student.firstName} ${student.lastName}`;
  const studentGithubHandle = student.github;
  let matchedPrs = [];
  let uniqueMatchedPrCount = 0;
  try {
    const response = await githubQuery(`
      https://api.github.com/search/issues?q=is:pr+repo:hackreactor/${cohort}-toy-problems+author:${
      student.github
    }`);
    if (response && response.items && response.items.length) {
      const pullRequests = response.items.map(item => {
        return item.title;
      });
      matchedPrs = (await AllPrsWithMatchingTitles(pullRequests)) || [];
      // remove duplicates
      matchedPrs = [...new Set(matchedPrs.map(pr => pr.toLowerCase().trim()))];
      uniqueMatchedPrCount = await numberOfUniquePrsWithMatchingTitles(matchedPrs);
    }
  } catch (error) {
    console.log(error);
    return [{ commit: { message: 'no pr!' } }];
  }
  return { cohort, studentName, studentGithubHandle, matchedPrs, uniqueMatchedPrCount };
};

const checkToyProblems = async cohort => {
  const studentsList = await getStudentsList(cohort);
  const getAllprs = async () => {
    return Promise.all(studentsList.map(async student => getPrListForStudent(cohort, student)));
  };
  const allPrs = await getAllprs();
  return allPrs;
};

module.exports = checkToyProblems;
