import PostCard from "../feed/PostCard";
import { useUserStore } from "../../store/useUserStore";
import { BaseModal } from "../ui";

export default function PostDetailModal({ post, onClose }) {
  const theme = useUserStore((state) => state.theme);
  if (!post) return null;

  return (
    <BaseModal
      open
      onClose={onClose}
      theme={theme}
      maxWidthClass="max-w-3xl"
      contentClassName="max-h-[90vh] overflow-y-auto p-0 [&::-webkit-scrollbar]:hidden"
    >
      <PostCard post={post} imageDisplayMode="contain" />
    </BaseModal>
  );
}