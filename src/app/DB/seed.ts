import { prisma } from "./prisma";

// Seeds the "Two Sum" problem with templates for all five languages and test cases.
// Safe to run more than once: it updates the problem and replaces its templates and test cases.

const problemData = {
  title: "Two Sum",
  description: "Given an array of integers `nums` and an integer `target`, return the **indices** of the two numbers that add up to `target`.\n\nEach input has **exactly one** solution, and you may not use the same element twice. Return the smaller index first.\n\n**Example 1**\n```\nInput: nums = [2, 7, 11, 15], target = 9\nOutput: [0, 1]\nExplanation: nums[0] + nums[1] == 9\n```\n\n**Example 2**\n```\nInput: nums = [3, 2, 4], target = 6\nOutput: [1, 2]\n```\n\n**Constraints**\n- 2 <= nums.length <= 10^4\n- -10^9 <= nums[i] <= 10^9\n- Exactly one valid answer exists",
  difficulty: "EASY" as const,
  functionName: "twoSum",
  published: true,
};

const tagNames = ["Array", "Hash Table"];

const templates = [
  {
    "language": "PYTHON",
    "prelude": "",
    "starterCode": "def twoSum(nums, target):\n    pass\n",
    "driverCode": "import sys\ndef _driver_main():\n    data = sys.stdin.read().split()\n    n = int(data[0])\n    nums = [int(x) for x in data[1:1 + n]]\n    target = int(data[1 + n])\n    res = twoSum(nums, target)\n    print(len(res))\n    print(\" \".join(map(str, res)))\n_driver_main()\n"
  },
  {
    "language": "JAVASCRIPT",
    "prelude": "",
    "starterCode": "function twoSum(nums, target) {\n\n}\n",
    "driverCode": "const __data = require('fs').readFileSync(0, 'utf8').split(/\\s+/).filter(Boolean);\nconst __n = parseInt(__data[0]);\nconst __nums = __data.slice(1, 1 + __n).map(Number);\nconst __target = Number(__data[1 + __n]);\nconst __res = twoSum(__nums, __target);\nconsole.log(__res.length);\nconsole.log(__res.join(' '));\n"
  },
  {
    "language": "CPP",
    "prelude": "#include <bits/stdc++.h>\nusing namespace std;\n",
    "starterCode": "vector<int> twoSum(vector<int>& nums, int target) {\n\n}\n",
    "driverCode": "int main() {\n    int n; cin >> n;\n    vector<int> nums(n);\n    for (int i = 0; i < n; i++) cin >> nums[i];\n    int target; cin >> target;\n    vector<int> res = twoSum(nums, target);\n    cout << res.size() << \"\\n\";\n    for (size_t i = 0; i < res.size(); i++) { if (i) cout << \" \"; cout << res[i]; }\n    cout << \"\\n\";\n    return 0;\n}\n"
  },
  {
    "language": "JAVA",
    "prelude": "import java.util.*;\n",
    "starterCode": "class Solution {\n    public int[] twoSum(int[] nums, int target) {\n\n    }\n}\n",
    "driverCode": "public class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        int n = sc.nextInt();\n        int[] nums = new int[n];\n        for (int i = 0; i < n; i++) nums[i] = sc.nextInt();\n        int target = sc.nextInt();\n        int[] res = new Solution().twoSum(nums, target);\n        StringBuilder sb = new StringBuilder();\n        sb.append(res.length).append(\"\\n\");\n        for (int i = 0; i < res.length; i++) { if (i > 0) sb.append(\" \"); sb.append(res[i]); }\n        System.out.println(sb);\n    }\n}\n"
  },
  {
    "language": "C",
    "prelude": "#include <stdio.h>\n#include <stdlib.h>\n",
    "starterCode": "int* twoSum(int* nums, int numsSize, int target, int* returnSize) {\n\n}\n",
    "driverCode": "int main() {\n    int n; scanf(\"%d\", &n);\n    int* nums = (int*)malloc(n * sizeof(int));\n    for (int i = 0; i < n; i++) scanf(\"%d\", &nums[i]);\n    int target; scanf(\"%d\", &target);\n    int returnSize = 0;\n    int* res = twoSum(nums, n, target, &returnSize);\n    printf(\"%d\\n\", returnSize);\n    for (int i = 0; i < returnSize; i++) { if (i) printf(\" \"); printf(\"%d\", res[i]); }\n    printf(\"\\n\");\n    return 0;\n}\n"
  }
] as const;

const testCases = [
  {
    "position": 0,
    "input": "4\n2 7 11 15\n9\n",
    "expectedOutput": "2\n0 1",
    "isSample": true
  },
  {
    "position": 1,
    "input": "3\n3 2 4\n6\n",
    "expectedOutput": "2\n1 2",
    "isSample": true
  },
  {
    "position": 2,
    "input": "2\n3 3\n6\n",
    "expectedOutput": "2\n0 1",
    "isSample": false
  },
  {
    "position": 3,
    "input": "5\n-1 -2 -3 -4 -5\n-8\n",
    "expectedOutput": "2\n2 4",
    "isSample": false
  },
  {
    "position": 4,
    "input": "4\n0 4 3 0\n0\n",
    "expectedOutput": "2\n0 3",
    "isSample": false
  },
  {
    "position": 5,
    "input": "4\n2 5 5 11\n10\n",
    "expectedOutput": "2\n1 2",
    "isSample": false
  }
];

async function main() {
  const problem = await prisma.problem.upsert({
    where: { slug: "two-sum" },
    update: problemData,
    create: { slug: "two-sum", ...problemData },
  });

  // connect the tags (create them if they don't exist yet)
  await prisma.problem.update({
    where: { id: problem.id },
    data: {
      tags: {
        connectOrCreate: tagNames.map((name) => ({ where: { name }, create: { name } })),
      },
    },
  });

  await prisma.problemTemplate.deleteMany({ where: { problemId: problem.id } });
  await prisma.problemTemplate.createMany({
    data: templates.map((t) => ({ problemId: problem.id, ...t })),
  });

  await prisma.testCase.deleteMany({ where: { problemId: problem.id } });
  await prisma.testCase.createMany({
    data: testCases.map((t) => ({ problemId: problem.id, ...t })),
  });

  console.log(`Seeded "${problem.title}" (id ${problem.id}) with ${templates.length} templates and ${testCases.length} test cases.`);
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
