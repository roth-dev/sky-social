import { Text } from "@/components/ui";
import { useAuth } from "@/contexts/AuthContext";
import UserProfile from "@/components/profile/UserProfile";

export default function ProfileScreen() {
  const { user } = useAuth();
  if (!user) return <Text>User not found</Text>;
  return <UserProfile handle={user.handle} />;
}
