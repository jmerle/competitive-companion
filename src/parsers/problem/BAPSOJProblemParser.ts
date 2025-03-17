import { Sendable } from '../../models/Sendable';
import { TaskBuilder } from '../../models/TaskBuilder';
import { request } from '../../utils/request';
import { Parser } from '../Parser';

interface BAPSOJContestInfo {
  id: number;
  problem_set: {
    id: number;
    problem_id: number;
    slug: string;
    title: string;
    is_visible: boolean;
    submission_meta: {
      unique_users_accepted: number;
      unique_users_tried: number;
      user_tried: number;
      user_accepted: number;
      has_user_accepted: boolean;
    };
    problem_order_character: string;
    problem_order: number;
  }[];
  permissions: string[];
  role: string;
  created_at: string;
  updated_at: string;
  slug: string;
  title: string;
  description: string;
  contest_type: string;
  standing_type: string;
  starts_at: string;
  ends_at: string;
  duration: number;
  contest_visibility: string;
  is_frozen: boolean;
  problem_point: string;
  created_by: string;
}

interface BAPSOJProblemInfo {
  id: number;
  created_by: string;
  attachments: any[];
  problem_set: {
    id: number;
    created_at: string;
    updated_at: string;
    sample_input: string;
    sample_output: string;
    title: string;
    problem: number;
  };
  input_output_samples: {
    id: number;
    order_character: string;
    created_at: string;
    updated_at: string;
    sample_input: string;
    sample_output: string;
    problem_order: number;
    contest: number;
    problem: number;
  }[];
  created_at: string;
  updated_at: string;
  slug: string;
  title: string;
  description: string;
  input_description: string;
  output_description: string;
  constraints: null;
  note: string;
  problem_type: string;
  time_limit: number;
  memory_limit: number;
  cpu_limit: number;
  output_limit: number;
  source_limit: number;
  exec_limit: number;
  is_visible: boolean;
  tags: string[] | null;
}

export class BAPSOJProblemParser extends Parser {
  public getMatchPatterns(): string[] {
    return ['https://bapsoj.org/contests/*/problems/*'];
  }

  private async getProblemInfo(contest: string, problem: string): Promise<BAPSOJProblemInfo> {
    const config: RequestInit = {
      credentials: 'omit',
      headers: {
        Authorization: `token ${localStorage.getItem('@baps-oj/user/token')}`,
      },
    };

    const contestInfoAPIResponse = await request(`https://api.bapsoj.org/api/judge/contests/${contest}/`, config);
    const contestInfo = JSON.parse(contestInfoAPIResponse) as BAPSOJContestInfo;
    const problemId = contestInfo.problem_set.find(p => p.problem_order_character === problem).problem_id;

    const problemInfoAPIResponse = await request(
      `https://api.bapsoj.org/api/judge/problems/${problemId}/?problem_set_id=${problemId}`,
      config,
    );

    return JSON.parse(problemInfoAPIResponse) as BAPSOJProblemInfo;
  }

  public async parse(url: string): Promise<Sendable> {
    const task = new TaskBuilder('BAPS OJ').setUrl(url);
    const [contest, , problem] = url.split('/').slice(-3);
    const problemInfo = await this.getProblemInfo(contest, problem);

    await task.setName(`${problem}. ${problemInfo.title}`);
    task.setTimeLimit(problemInfo.time_limit);
    task.setMemoryLimit(problemInfo.memory_limit);

    problemInfo.input_output_samples.forEach(sample => {
      task.addTest(sample.sample_input, sample.sample_output);
    });

    return task.build();
  }
}
