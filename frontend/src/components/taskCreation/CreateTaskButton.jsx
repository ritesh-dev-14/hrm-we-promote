import { Plus } from "lucide-react";
import { motion } from "framer-motion";

const CreateTaskButton = ({
  title = "Create Task",
  onClick,
}) => {
  return (
    <motion.button
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="group h-12 px-5 rounded-2xl bg-slate-900 text-white text-sm font-semibold inline-flex items-center gap-2 shadow-lg hover:shadow-xl transition-all duration-300"
    >
      <Plus
        size={18}
        className="group-hover:rotate-90 transition-transform duration-300"
      />

      {title}
    </motion.button>
  );
};

export default CreateTaskButton;