import { listBookings } from './tools';

async function main() {
  const toolName = process.argv[2];
  const argsJson = process.argv[3];

  if (!toolName) {
    console.error('Tool name required');
    process.exit(1);
  }

  let args = {};
  if (argsJson) {
    try {
      args = JSON.parse(argsJson);
    } catch (e) {
      console.error('Invalid JSON args');
      process.exit(1);
    }
  }

  try {
    let result;
    switch (toolName) {
      case 'list_bookings':
        result = await listBookings(args as any);
        break;
      default:
        console.error(`Unknown tool: ${toolName}`);
        process.exit(1);
    }
    console.log(JSON.stringify(result, null, 2));
  } catch (error: any) {
    console.error(error.message);
    process.exit(1);
  }
}

main();
