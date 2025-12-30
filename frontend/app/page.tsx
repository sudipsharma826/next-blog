import { User } from '@workspace/shared-types';
import { createUserNameFromEmail } from '@workspace/shared-utils';

function checkTypesAndUtils(): boolean {
  // Check if type works
  let typeWorks = false;
  try {
    const testUser: User = { id: '1', email: 'test@example.com', name: 'Test' };
    typeWorks =
      typeof testUser.id === 'string' &&
      typeof testUser.email === 'string' &&
      typeof testUser.name === 'string';
  } catch {
    typeWorks = false;
  }
  // Check if util works
  let utilWorks = false;
  try {
    const name = createUserNameFromEmail('sudeepsharma826@gmail.com');
    utilWorks = typeof name === 'string' && name.length > 0;
  } catch {
    utilWorks = false;
  }
  return typeWorks && utilWorks;
}

export default function Home() {
  const bothWork = checkTypesAndUtils();
  return (
    <div className="text-6xl text-blue-400 justify-center">{bothWork ? 'Working' : 'false'}</div>
  );
}
