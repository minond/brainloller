module Util exposing (asList)

import Maybe


asList : Maybe (List a) -> List a
asList list =
    Maybe.withDefault [] list
